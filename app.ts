import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';
import { Cache } from './source/cache';
import { Syncer } from './source/syncer';
import { Mapper } from './source/mapper';
import { Handler } from './source/handler';
import { CrownstoneCloud } from 'crownstone-cloud';
import { CrownstoneSSE } from 'crownstone-sse';

/**
 * The Crownstone app gets data about so-called spheres, rooms, and devices from the Crownstone cloud. 
 * The user fills in username and password. The latter is stored locally in the form of a hash.
 */
class CrownstoneApp extends Homey.App {

	cache: Cache;
	cloud: CrownstoneCloud;
	sse: CrownstoneSSE;
	syncer: Syncer;
	mapper: Mapper;
	handler: Handler;
	loggedIn: boolean;
	useCloudConnection: any;
	useBleConnection: any;
	pollPresenceInterval: number;
	pollPresenceFunction: NodeJS.Timeout;

	/**
	 * When the app is initialized, email and password of the Crownstone user is obtained through form data.
	 * Instances of the flowcard triggers and conditions are initialized.
	 */
	async onInit(): Promise<void> {
		console.log('Initialize Crownstone app');
		this.cloud = new CrownstoneCloud();
		this.sse = new CrownstoneSSE();
		this.cache = new Cache();
		this.syncer = new Syncer(this.cloud, this.cache);
		this.mapper = new Mapper(this.cache);
		// @ts-ignore
		this.handler = new Handler(this.homey, this.mapper);

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

		this.pollPresenceInterval = 30;
		await this.pollPresenceData();

		this.handler.onInit();
	}

	getInternationalizedMessage(messageId: string) {
		// @ts-ignore
		return this.homey.__(messageId);
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
		await this.syncer.getSpheres();
		await this.syncer.getLocations();
		await this.syncer.getUsers();
		await this.syncer.getPresence();
		await this.syncer.getCrownstones();
		
		this.updateDevices();
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
			await this.syncer.login(email, password);
		}
		catch(e) {
			console.log('There was a problem logging into the Crownstone cloud:', e);
			return;
		}
		try {
			await this.loginToEventServer(email, password);
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
		this.pollPresenceFunction = setInterval(() => {
			this.syncer.getPresence();
		}, 1000 * 60 * this.pollPresenceInterval);
	}

	/**
	 * This function will stop the code that listens to SSE events from the SSE server, authenticate and start
	 * listening again.
	 */
	async loginToEventServer(email: string, password: string) {
		await this.sse.stop();
		await this.sse.loginHashed(email, password);
		await this.sse.start(this.sseEventHandler);
	}

	/**
	 * The sseEventHandler receives events from the sse-server and fires the runLocationTrigger-function
	 * when a user enters or leaves a room.
	 * todo: when the state of a Crownstone changes outside of the app, update the capabilityValue.
	 *
	 * Incoming events from the event server are of form (exit event example):
	 *   {
	 *     type: 'presence',
	 *     subType: 'exitLocation',
	 *     sphere: { id: '$sphereId', name: '$sphereName', uid: 1 },
	 *     location: { id: '$locationId', name: '$locationName' },
	 *     user: { id: '$userId', name: '$userName' }
	 *   }
	 */
	sseEventHandler = (data: any) => {
		//console.log(data);
		if (data.type === 'system') {
			// e.g. stream starting
		}
		if (data.type === 'presence') {
			if (data.subType === 'enterLocation') {
				this.runLocationTrigger(data, true);
			}
			if (data.subType === 'exitLocation') {
				this.runLocationTrigger(data, false);
			}
		}
		// deletion and addition of Crownstones
		if (data.type === 'dataChange') {
			if (data.subType === 'stones') {
				if (data.operation === 'update') {
					console.log('Data update event');
					let deviceId = data.changedItem.id;
					this.updateCrownstoneCapabilities(deviceId).catch(this.error);
				}
				if (data.operation === 'delete') {
					console.log('Data deletion event');
					let deviceId = data.changedItem.id;
					this.deleteDevice(deviceId).catch(this.error);
				}
			}
		}
		if (data.type === 'abilityChange') {
			if (data.subType === 'dimming') {
				console.log('Ability change event');
				let deviceId = data.stone.id;
				let dimAbilityState = data.ability.enabled;
				this.setDimmingAbilityState(deviceId, dimAbilityState).catch(this.error);
			}
		}
		if (data.type === 'switchStateUpdate') {
			if (data.subType === 'stone') {
				console.log('Update status of Crownstone');
				let deviceId = data.crownstone.id;
				let device = this.getDevice(deviceId);
				if (device) {
					// @ts-ignore
					device.changeOnOffStatus(data.crownstone.percentage);
				}
			}
		}
		if (data.type === 'command') {
			if (data.subType === 'multiSwitch') {
				// this is the command we should rather react to a switchStateUpdate
			}
		}
	};
	
	/**
	 * This function will update the user locations and fire the trigger for the flows that use this as event.
	 * The event can be an enter or exit event.
	 * Only an enter event will trigger the presence condition.
	 */
	async runLocationTrigger(data: { user: any; location: any; }, enterEvent: boolean) {
		let user = data.user;
		let location = data.location;
		if (!enterEvent) {
			console.log("Ignore exit events (for now)");
		}
		await this.handler.moveUser(user, location);
	}


	/********************************** Interface with Crownstone device driver **************************************/

	/**
	 * Get the Homey device from the Crownstone driver given a device id.
	 */
	getDevice(deviceId: string) {
		let driver;
		try {
			// @ts-ignore
			driver = this.homey.drivers.getDriver('crownstone');
		} catch(e) {
			console.log('Driver not (yet) available');
			return;
		}
		let data = { id: deviceId };
		let device = driver.getDevice(data);
		return device;
	}

	/**
	 * Update devices to be sure they are up to date w.r.t. state and capabilities. The order of initialization
	 * in version 3 of Homey should be first app and then devices.
	 */
	updateDevices() {
		let driver;
		try {
			// @ts-ignore
			driver = this.homey.drivers.getDriver('crownstone');
		} catch(e) {
			console.log('Driver not (yet) available');
			return;
		}
		let devices = driver.getDevices();
		for (let i = 0; i < devices.length; ++i) {
			let device = devices[i];
			// @ts-ignore
			device.updateCrownstoneCapabilities();
			// @ts-ignore
			device.updateCrownstoneState();
		}
	}

	/**
	 * Update dimming ability setting of a particular Crownstone within Homey.
	 */
	async setDimmingAbilityState(deviceId: string, dimAbilityState: boolean) {
		let device = this.getDevice(deviceId);
		if (!device) {
			console.log("Device " + deviceId + " cannot be found");
			return;
		}
	
		try {
			// @ts-ignore
			await device.changeDimCapability(dimAbilityState);
		}
		catch(e) {
			console.log('There was a problem updating the dimming capability of a device:', e);
		};
	}

	/**
	 * Update "locked" information about Crownstone by updating all capabilities from the cloud (it is a single call).
	 */
	async updateCrownstoneCapabilities(deviceId: string) {
		let device = this.getDevice(deviceId);
		if (!device) {
			console.log("Device " + deviceId + " cannot be found, cannot lock.");
			return;
		}

		// @ts-ignore
		device.updateCrownstoneCapabilities();
	}

	/**
	 * Update "state" of the Crownstone
	 */
	async updateCrownstoneState(deviceId: string) {
		let device = this.getDevice(deviceId);
		if (!device) {
			console.log("Device " + deviceId + " cannot be found, cannot update state.");
			return;
		}

		// @ts-ignore
		device.updateCrownstoneState();
	}

	/**
	 * This function will set the device as unavailable, since there is no method to delete a device from
	 * the app yet.
	 */
	async deleteDevice(deviceId: string) {
		let device = this.getDevice(deviceId);
		if (!device) {
			console.log("Device " + deviceId + " cannot be found, cannot delete it.");
			return;
		}
		let msg = this.getInternationalizedMessage('deletedMessage');
		await device.setUnavailable(msg);
		await device.setStoreValue('deleted', true);
	}

}

module.exports = CrownstoneApp;
