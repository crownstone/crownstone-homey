import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';
import { SlowCache } from './source/slowCache';
import { FastCache } from './source/fastCache';
import { Mirror } from './source/mirror';
import { Mapper } from './source/mapper';
import { Handler } from './source/handler';
import { DeviceManager } from './source/deviceManager';
import { ServerEvents } from './source/serverEvents';
import { CrownstoneCloud } from 'crownstone-cloud';
import { CrownstoneSSE } from 'crownstone-sse';

const DEFAULT_POLL_PRESENCE_INTERVAL_MINUTES = 30;
const DEFAULT_ROOM_SWITCH_TIMEOUT_SECONDS = 3;

/**
 * The Crownstone app gets data about so-called spheres, rooms, and devices from the Crownstone cloud. 
 * The user fills in username and password. The latter is stored locally in the form of a hash.
 */
class CrownstoneApp extends Homey.App implements crownstone_App {

	slowCache: SlowCache;
	fastCache: FastCache;
	cloud: CrownstoneCloud;
	sse: CrownstoneSSE;
	mirror: Mirror;
	mapper: Mapper;
	handler: Handler;
	deviceManager: DeviceManager;
	serverEvents: ServerEvents;
	loggedIn: boolean;
	pollPresenceInterval: number;
	roomSwitchTimeoutSeconds: number;
	roomSwitchFunction: NodeJS.Timeout;

	/**
	 * When the app is initialized, email and password of the Crownstone user is obtained through form data.
	 * Instances of the flowcard triggers and conditions are initialized.
	 */
	async onInit(): Promise<void> {
		console.log('Initialize Crownstone app');
		this.cloud = new CrownstoneCloud();
		this.sse = new CrownstoneSSE();
		this.slowCache = new SlowCache();
		this.fastCache = new FastCache();
		this.mirror = new Mirror(this.cloud, this.slowCache);
		this.mapper = new Mapper(this.slowCache, this.fastCache);
		// @ts-ignore
		this.handler = new Handler(this.homey, this.fastCache);
		this.deviceManager = new DeviceManager(this.homey);
		this.serverEvents = new ServerEvents(this, this.sse);

		// get sampling repeats from settings dialog
		this.roomSwitchTimeoutSeconds = this.homey.settings.get('samplingRepeats');
		console.log('Set room switch timeout to ' + this.roomSwitchTimeoutSeconds);

		// Disable logging for the cloud (logs every request and response)
		this.cloud.log.config.setLevel('none');

		// Logged in field (is also used in configuration dialog)
		this.loggedIn = false;

		// @ts-ignore
		console.log(`App ${this.homey.app.manifest.name.en} is running...`);

		// If there is no account information, the user has to go to settings to fill in the account data.
		// We will not retry at a later time.
		if (!this.containsAccountSettings()) {
			console.log('There are no account settings... Cannot log in');
			return;
		}

		console.log('Login to servers');
		await this.synchronizeCloud();

		this.pollPresenceInterval = DEFAULT_POLL_PRESENCE_INTERVAL_MINUTES;
		await this.pollPresenceData();

		//this.handler.onInit();
	}

	/**
	 * Uninitialize app. Important for Homey cloud.
	 */
	async onUninit(): Promise<void> {
		console.log('Uninitialize Crownstone app');
		this.loggedIn = false;
	}

	/**
	 * Assumes email and password are stored in settings. We will now set up all connections and retrieve the data
	 * from the Crownstone servers.
	 */
	async synchronizeCloud() {
		// @ts-ignore
		let email = this.homey.settings.get('email');
		// @ts-ignore
		let password = this.homey.settings.get('password');
		try {
			await this.setupConnections(email, password);
		}
		catch(e) {
			console.log('There was a problem making the connections:', e);
			return;
		};

		console.log('Obtain all data from the cloud');
		await this.mirror.getAll();
		
		console.log('Map all items from the slow to the fast cache');
		await this.mapper.mapAll();

		// update homey devices
		this.deviceManager.updateDevices();
	}

	/**
	 * This function will be called when a user changes the credentials in the settings page.
	 */
	async setSettings(email: string, password: string) {
		if (!email) {
			console.log("No email address filled in");
			return false;
		}
		if (!password) {
			console.log("No password filled in");
			return false;
		}

		try {
			await this.setupConnections(email, password);
		}
		catch(e) {
			console.log('There was a problem with these settings (cannot log in):', e);
			return false;
		}

		// @ts-ignore
		this.homey.settings.set('email', email);
		// @ts-ignore
		this.homey.settings.set('password', password);
		return this.loggedIn;
	}

	/**
	 * This function will check if the email or password is either empty, null or undefined, and will
	 * return a boolean.
	 */
	containsAccountSettings() {
		// @ts-ignore
		if (!this.homey.settings.get('email')) {
			return false;
		}
		// @ts-ignore
		if (!this.homey.settings.get('password')) {
			return false;
		}
		return true;
	}

	/**
	 * This function will make a connection with the Crownstone cloud server and the event server.
	 */
	async setupConnections(email: string, password: string) {
		this.loggedIn = false;
		try {
			await this.mirror.login(email, password);
		}
		catch(e) {
			console.log('There was a problem logging into the Crownstone cloud:', e);
			return;
		}
		try {
			await this.serverEvents.login(email, password);
		}
		catch(e) {
			console.log('There was a problem making a connection with the event server:', e);
			return;
		}
		this.loggedIn = true;
		console.log('Authenticated with cloud and event servers');
	}

	/**
	 * This function will at regular times update the presence information in case we miss some events from the
	 * event server.
	 */
	async pollPresenceData() {
		this.homey.setInterval(() => {
			this.mirror.getPresence();
		}, 1000 * 60 * this.pollPresenceInterval);
	}
	
	/**
	 * This function will update the user locations and fire the trigger for the flows that use this as event.
	 * The event can be an enter or exit event.
	 * Only an enter event will trigger the presence condition.
	 *
	 * The timeout is by default 3 seconds and can be user-defined (only made slower). The function will be default not
	 * immediately translate a location trigger into a perceived move of a user. If there is another event coming in
	 * and is fast enough it will cancel the move. This leads to the following behaviour:
	 *
	 *   + If the localization algorithm occassionally switches to another room it will often classify this room wrong
	 *   once or twice and then switch back to the right room. This will remove those spurious classification events.
	 *   + If the localization algorithm switches very often from one to another very regulary, this will cancel all
	 *   those events (hence the system will not be able to determine in which room you are, which is true!). You can
	 *   best then retrain the system or add a Crownstone in close proximity to one of those rooms to make it easier
	 *   for the classifier.
	 *   + The higher the timeout is set the slower the system responds. This works perfectly for scenarios in which
	 *   you want the light to go on when you are in a room and it is getting dark outside. However, for instantaneous
	 *   switching when walking into a room this might get too slow!
	 */
	async runLocationTrigger(data: { user: any; location: any; }, enterEvent: boolean) {
		// ignore exit events for now
		if (!enterEvent) {
			return;
		}

		// timeout at least a default number of seconds, multiply by 1000 to have it in ms
		let timeout = this.roomSwitchTimeoutSeconds;
		if (timeout < DEFAULT_ROOM_SWITCH_TIMEOUT_SECONDS) timeout = DEFAULT_ROOM_SWITCH_TIMEOUT_SECONDS;
		timeout = timeout * 1000;

		// cancel previous call
		clearTimeout(this.roomSwitchFunction);

		// set room to switch in X seconds
		this.roomSwitchFunction = setTimeout(async () => {
			let user = data.user;
			let location = data.location;
			await this.handler.moveUser(user, location);
		}, timeout);
	}
}

module.exports = CrownstoneApp;
