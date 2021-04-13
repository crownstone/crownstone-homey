'use strict';

const Homey = require('homey');
const cloudLib = require('crownstone-cloud');
const sseLib = require('crownstone-sse');

/**
 * The Crownstone app gets data about so-called spheres, rooms, and devices from the Crownstone cloud. 
 * The user fills in username and password. The latter is stored locally in the form of a hash.
 */
class CrownstoneApp extends Homey.App {

	/**
	 * When the app is initialized, email and password of the Crownstone user is obtained through form data.
	 * Instances of the flowcard triggers and conditions are initialized.
	 */
	onInit() {
		this.log('Initialize Crownstone app');
		this.cloud = new cloudLib.CrownstoneCloud();
		this.sse = new sseLib.CrownstoneSSE();
		
		// Disable logging for the cloud (logs every request and response)
		this.cloud.log.config.setLevel('none');

		this.presenceTrigger = this.homey.flow.getTriggerCard('user_enters_room');
		this.presenceCondition = this.homey.flow.getConditionCard('user_presence');

		// spheres are homes people have access to (their own home, homes of friends, holiday homes)
		// REVIEW: Move this and all required util methods around this to a db class to de-clutter this class.
		// REVIEW: Might it be easier to make these objects with the id as key and the element as value? This makes it easy to lookup references.
		this.spheres = [];
		// locations are zones or rooms per sphere (per home)
		this.locations = [];
		// users are people with accounts that have access
		this.users = [];
		// userLocations is an array with per user their location stored (we assume that a single smartphone device
		// represents the user for now)
		this.userLocation = [];

		this.loggedIn = false;
		//this.setupInProgress = false;

		this.log(`App ${this.homey.app.manifest.name.en} is running...`);
		this.email = this.homey.settings.get('email');
		this.password = this.homey.settings.get('password');
		this.cloudActive = this.homey.settings.get('cloud');
		this.bleActive = this.homey.settings.get('ble');

		this.eventTimerId = null;
		this.eventTimerExit = false;

		// REVIEW: Completely remove the BLE. It should never be used until we have a solid framework that uses a persistent connection to a crownstone.
		/**
		 * The default only enables cloud. This is due to limitations w.r.t. Bluetooth LE on the Homey. The Homey
		 * does only have support for Bluetooth LE connections. That means that if you switch a Crownstone through
		 * making a connection, that Crownstone has to be in range. That is not a good user experience. Hence, the
		 * feature should be considered beta functionality. There are two possible ways to solve this in the future:
		 *
		 * 1. As soon as Homey supports Bluetooth LE advertisements we do not need to implement connections at all.
		 * We can then just broadcast the commands.
		 *
		 * 2. If this does not happen we can connect to a Crownstone nearby and have the information propagate through
		 * the Crownstone network. However, setting up a connection is also slow. Hence, this will preferably require
		 * a permanent connection. Hopefully Homey will allow apps to keep up such a permanent connection. On the
		 * Crownstone side this means that it should support multiple connections at the same time (so the Homey
		 * does not lock a Crownstone).
		 *
		 */
		if (!this.cloudActive && !this.bleActive) {
			this.homey.settings.set('cloud', true);
			this.homey.settings.set('ble', false);
		}
		
		this.log('Login to servers');
		// REVIEW: what happens if this is not configured? Is the entire app rebooted on login?
		if (this.isConfigured()) {
			this.asyncInit();

			this.pollPresenceData().catch((e) => {
				// REVIEW: this will never throw. The function inside the setInterval does not propagate the error to this method.
				this.log('There was a problem repeating code:', e);
			});
		}

		this.homey.settings.on('set', function () {
			this.cloudActive = this.homey.settings.get('cloud');
			this.bleActive = this.homey.settings.get('ble');
		});


		// REVIEW: Move these things to their own classes together with their required util methods.
				/**
				 * This code runs when a trigger has been fired. If the room id and user id are equal, the flow will run.
				 */
				this.presenceTrigger.registerRunListener((args, state) =>
					// REVIEW: If you mark the function as async, the return as promise is implied.
					Promise.resolve(args.rooms.id === state.locationId && args.users.id === state.userId
						|| args.users.id === 'default')
				);

				/**
				 * This code runs after a trigger has been fired and a condition-card is configured in the flow.
				 * If the room id and user id are equal to the name and id from the room the user is currently in, the flow will run.
				 */
				this.presenceCondition.registerRunListener(async (args) => {
					if (args.users.id === 'default') {
						return this.checkRoomId(args.rooms.id);
					}
					else {
						let userInList = this.checkUserId(args.users.id);
						if (userInList > -1) {
							// REVIEW: Why use promise resolve here? Just return the value. The async method implies that it's a promise already.
							return Promise.resolve(args.rooms.id === this.userLocation[userInList].locationId);
						}
						return false;
					}
				});

				/**
				 * This code runs when a flow is being constructed for a trigger-card, and a room should be selected.
				 * This code returns a list of rooms in a sphere which is shown to the user.
				 */
				this.presenceTrigger.getArgument('rooms').registerAutocompleteListener(() => {
					this.log('Extract rooms for presence trigger');
					return this.extractRooms();
				});

				/**
				 * This code runs when a flow is being constructed for a trigger-card, and a user should be selected.
				 * This code returns a list of users in a sphere.
				 */
				this.presenceTrigger.getArgument('users').registerAutocompleteListener(() => {
					this.log('Extract users for presence trigger');
					return this.extractUsers();
				});

				/**
				 * This code runs when a flow is being constructed for a condition-card, and a room should be selected.
				 * This code returns a list of rooms in a sphere.
				 */
				this.presenceCondition.getArgument('rooms').registerAutocompleteListener(() => {
					this.log('Extract rooms for presence condition');
					return this.extractRooms();
				});

				/**
				 * This code runs when a flow is being constructed for a condition-card, and a user should be selected.
				 * This code returns a list of users in a sphere.
				 */
				this.presenceCondition.getArgument('users').registerAutocompleteListener(() => {
					this.log('Extract users for presence condition');
					return this.extractUsers();
				});

	}

	async asyncInit() {
		// REVIEW: failing the setup is not propated. How is this error handled?
		await this.setupConnections(this.email, this.password).catch((e) => {
			this.log('There was a problem making the connections:', e);
		});
		this.log('Obtain all data from the cloud');
		// REVIEW: Make a db class which does all these util methods relating to getting/updating/syncing this data.
		// REVIEW: Too much data/methods are tacked on to this app class that do not neccesarily belong on the same level as the app core.
		await this.getSpheres();
		await this.getLocations();
		await this.getUsers();
		await this.getKeys();
		await this.getPresence(); // not used yet
		await this.getCrownstones();
		
		/**
		 * Update devices to be sure they are up to date w.r.t. state and capabilities (order of initialization
		 * between app and devices is not set).
		 */
		let devices = this.homey.drivers.getDriver('crownstone').getDevices();
		for (let i = 0; i < devices.length; ++i) {
			let device = devices[i];
			device.updateCrownstoneCapabilities();
			device.updateCrownstoneState();
		}
	}

	/**
	 * This function will be called when a user changes the credentials in the settings page.
	 */
	async setSettings(email, password) {
		this.homey.app.email = email;
		this.homey.app.password = password;
		// REVIEW: this check is unclear, this should just check if the provided email and password are filled or not, not first set them to homey.app
		if (!this.isConfigured()) {
			this.homey.settings.set('email', '');
			this.homey.settings.set('password', '');
			this.loggedIn = false;
			return this.loggedIn;
		}

		// REVIEW: This error is not propagated, that means the email and password will be sved.
		await this.setupConnections(email, password).catch((e) => {
			this.log('There was a problem making the connections:', e);
		});
		this.homey.settings.set('email', email);
		this.homey.settings.set('password', password);
		return this.loggedIn;
	}

	/**
	 * This function will check if the email or password is either empty, null or undefined, and will
	 * return a boolean.
	 */
	isConfigured() {
		if (!this.homey.app.email || !this.homey.app.password) {
			return false;
		}
		return true;
	}

	/**
	 * This function will make a connection with the cloud, call the function to get all the users and
	 * their locations in the sphere, and call the function to make a connection to the event server.
	 */
	async setupConnections(email, password) {
		//this.setupInProgress = true;
		this.loggedIn = false;
		await this.cloud.loginHashed(email, password).catch((e) => {
			this.log('There was a problem making a connection to the cloud:', e);
			// REVIEW: This does not early-abort the method. If that's what you want, use a try-catch.
			// REVIEW: You're returning the catch callback, not the setupConnections.
			return;
		});
		this.log('Authenticated with the Crownstone cloud');
		await this.loginToEventServer(email, password).catch((e) => {
			this.log('There was a problem making a connection with the event server:', e);
			// REVIEW: This does not early-abort the method. If that's what you want, use a try-catch.
			// REVIEW: You're returning the catch callback, not the setupConnections.
			return;
		});
		this.log('Authenticated with the event server');
		// REVIEW: remove commented out line which is probably leftover from previous versions
		//this.setupInProgress = false;
		this.loggedIn = true;
		this.log('Authenticated with cloud and event servers');
	}

	/**
	 * This function will call the getPresentPeople-function every 30 minutes in case of missed events.
	 */
	async pollPresenceData() {
		// REVIEW: This interval needs to be registered and cleaned up. We don't want to have multiple instances of this running.
		// REVIEW: Cleanup is usually on init, on logout etc.
		setInterval(() => {
			this.getPresence();
		}, 1000 * 1800); // 30 minutes
	}

	/**
	 * This function will stop the code that listens to SSE events from the SSE server, authenticate and start
	 * listening again.
	 */
	async loginToEventServer(email, password) {
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
	sseEventHandler = (data) => {
		//this.log(data);
		if (data.type === 'system') {
			// e.g. stream starting
		}
		if (data.type === 'ping') {
			// REVIEW: SSE lib already does this, you don't need to add a todo for this.
			// regular updates, todo: if not receiving, restart
		}
		if (data.type === 'presence') {
			if (data.subType === 'enterLocation') {
				this.setLocationTimer(data, true);
			}
			if (data.subType === 'exitLocation') {
				this.setLocationTimer(data, false);
			}
		}
		// deletion and addition of Crownstones
		if (data.type === 'dataChange') {
			if (data.subType === 'stones') {
				if (data.operation === 'update') {
					this.log('Data update event');
					let deviceId = data.changedItem.id;
					this.updateCrownstoneCapabilities(deviceId).catch(this.error);
				}
				if (data.operation === 'delete') {
					this.log('Data deletion event');
					let deviceId = data.changedItem.id;
					this.deleteDevice(deviceId).catch(this.error);
				}
			}
		}
		if (data.type === 'abilityChange') {
			if (data.subType === 'dimming') {
				this.log('Ability change event');
				let deviceId = data.stone.id;
				let dimAbilityState = data.ability.enabled;
				this.setDimmingAbilityState(deviceId, dimAbilityState).catch(this.error);
			}
		}
		if (data.type === 'switchStateUpdate') {
			if (data.subType === 'stone') {
				this.log('Update status of Crownstone');
				let deviceId = data.crownstone.id;
				let device = this.getDevice(deviceId);
				if (device) {
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

	setLocationTimer(data, enterEvent) {
		if (!enterEvent) {
			//this.log('Exit location event');
			return;
		}
		
		//this.log('Enter location event');
		// REVIEW: What's the goal of this timer? Is this an attempted smoothing filter of the localization?
		clearTimeout(this.eventTimerId);
		this.eventTimerId = setTimeout(() => {
			this.runLocationTrigger(data, enterEvent).catch((e) => {
				this.log('There was a problem firing the trigger:', e);
			});
		}, 5000)
	}

	getDevice(deviceId) {
		let data = { id: deviceId };
		let device = this.homey.drivers.getDriver('crownstone').getDevice(data);
		return device;
	}

	/**
	 * Update dimming ability setting of a particular Crownstone within Homey.
	 */
	async setDimmingAbilityState(deviceId, dimAbilityState) {
		let device = this.getDevice(deviceId);
		if (!device) {
			this.log("Device " + deviceId + " cannot be found");
			return;
		}

		await device.changeDimCapability(dimAbilityState).catch((e) => {
			this.log('There was a problem updating the dimming capability of a device:', e);
		});
	}

	/**
	 * Update "locked" information about Crownstone by updating all capabilities from the cloud (it is a single call).
	 */
	async updateCrownstoneCapabilities(deviceId) {
		let device = this.getDevice(deviceId);
		if (!device) {
			this.log("Device " + deviceId + " cannot be found, cannot lock.");
			return;
		}

		device.updateCrownstoneCapabilities();
	}

	/**
	 * Update "state" of the Crownstone
	 */
	async updateCrownstoneState(deviceId) {
		let device = this.getDevice(deviceId);
		if (!device) {
			this.log("Device " + deviceId + " cannot be found, cannot update state.");
			return;
		}

		device.updateCrownstoneState();
	}

	/**
	 * This function will set the device as unavailable, since there is no method to delete a device from
	 * the app yet.
	 */
	async deleteDevice(deviceId) {
		let device = this.getDevice(deviceId);
		// REVIEW: is this a hack?
		let msg = this.homey__('deletedMessage');
		await device.setUnavailable(msg);
		await device.setStoreValue('deleted', true);
	}

	/**
	 * This function will update the user locations and fire the trigger for the flows that use this as event.
	 * The event can be an enter or exit event.
	 * Only an enter event will trigger the presence condition.
	 */
	async runLocationTrigger(data, enterEvent) {
		let user = data.user;
		let location = data.location;
		let updated = this.updateUserLocation(user, location, enterEvent);
		const state = {userId: user.id, locationId: location.id};
		if (enterEvent && updated) {
			this.log('User ' + user.name + ' now at location ' + location.name);
			this.presenceTrigger.trigger(null, state).catch((e) => {
				this.log('Something went wrong:', e);
			});
		}
	}

	/**
	 * This function update list for user location. A user will be only in one location.
	 */
	updateUserLocation(user, location, enterEvent) {
		let userId = user.id;
		let locationId = location.id;
		let userInList = this.checkUserId(userId);
		if (enterEvent) {
			if (userInList < 0) {
				const userLocation = {
					userId: userId,
					locationId: locationId
				};
				this.userLocation.push(userLocation);
				return true;
			}
			else {
				if (this.userLocation[userInList].locationId == locationId) {
					return false;
				}
				this.userLocation[userInList].locationId = locationId;
				return true;
			}
		}

		// exit event
		if (userInList < 0) {
			// REVIEW: this does not return true/false. Is this intended?
			return;
		}
		// set to zero / nowhere
		this.userLocation[userInList].locationId = 0;
		return true;
	}

	/**
	 * This function will check if the userId is already defined in the list of userLocation and returns the index.
	 */
	checkUserId(userId) {
		// REVIEW: This is why it is beneficial to store the data as {userId: user} instead of [user]
		for (let i = 0; i < this.userLocation.length; i++) {
			if (this.userLocation[i].userId === userId) {
				// REVIEW: Why does this return i or -1, while the room checker is true/false?
				return i;
			}
		}
		return -1;
	}

	/**
	 * This function will check if the roomId exists in the list of userLocation and returns a boolean.
	 */
	// REVIEW: If you do really need these methods, perhaps move them to a util file?
	checkRoomId(roomId) {
		// REVIEW: This is why it is beneficial to store the data as {itemId: item} instead of [item]
		for (let i = 0; i < this.userLocation.length; i++) {
			if (this.userLocation[i].locationId === roomId) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get spheres object filled.
	 */
	// REVIEW: Move to own class.
	async getSpheres() {
		this.log('Get spheres');
		if (this.spheres.length) {
			this.log('Spheres already obtained');
			return;
		}
		if (this.isConfigured()) {
			try {
				this.spheres = await this.cloud.spheres();
			}
			catch(e) {
				this.log('Could not get spheres from the cloud', e);
			}
			if (!this.spheres.length) {
				this.log('Unable to find spheres');
			}
		}
	}

	/**
	 * Get all possible locations. This can be done at once for all spheres.
	 */
	// REVIEW: Move to own class.
	async getLocations() {
		this.log('Get locations');
		if (this.locations.length) {
			this.log('Location already obtained');
			return;
		}
		if (this.isConfigured()) {
			// REVIEW: The stone method does not call the cloud all the time to get stones if they're already cached, why do so for the locations?
			try {
				this.locations = await this.cloud.locations();
			} catch(e) {
				this.log('Could not get locations from the cloud', e);
			}
			if (!this.locations.length) {
				this.log('Unable to find locations');
			}
		}
	}

	/**
	 * Get all the users per sphere. Add them to the already existing array of spheres.
	 */
	// REVIEW: Move to own class.
	async getUsers() {
		this.log('Get users');
		if (!this.isConfigured()) {
			this.log('Not yet configured');
			return;
		}

		for (let i = 0; i < this.spheres.length; ++i) {
			let sphereId = this.spheres[i].id;
			try {
				this.spheres[i].users = await this.cloud.sphere(sphereId).users();
			} catch(e) {
				this.log('Could not get users for sphere: ' + sphereId, e);
			}
		}
	}
	
	/**
	 * Get all the users per sphere. Add them to the already existing array of spheres.
	 */
	// REVIEW: Move to own class.
	// REVIEW: Keys should not be required here. They are only required for bluetooth, but bluetooth should be removed.
	async getKeys() {
		this.log('Get keys');
		if (!this.isConfigured()) {
			this.log('Not yet configured');
			return;
		}

		// REVIEW: Prefer the usage of this.cloud.keys() and then use those. Current implementation will call the same method numerous times.
		for (let i = 0; i < this.spheres.length; ++i) {
			let sphereId = this.spheres[i].id;
			try {
				let allKeys = await this.cloud.sphere(sphereId).keys();
				this.spheres[i].keys = allKeys.sphereKeys;
			} catch(e) {
				this.log('Could not get users for sphere: ' + sphereId, e);
			}
		}
	}

	/**
	 * Get all the present users per sphere. Add them to the already existing spheres object.
	 * The cloud returns an array with [ { "userId", "locations[]" } ]
	 */
	async getPresence() {
		this.log("Get presence");
		if (this.isConfigured()) {
			for (let i = 0; i < this.spheres.length; ++i) {
				let sphereId = this.spheres[i].id;
				try {
					this.spheres[i].present = await this.cloud.sphere(sphereId).presentPeople();
				} catch(e) {
					this.log('Could not get presence data for sphere: ' + sphereId, e);
				}
			}
		}
	}

	/**
	 * Get all crownstones from the cloud.
	 */
	async getCrownstones() {
		this.log('Get crownstones devices');
		if (this.isConfigured()) {
			for (let i = 0; i < this.spheres.length; ++i) {
				let sphereId = this.spheres[i].id;
				if (this.spheres[i].crownstones) {
					// just hit server only once, do not update complete list of Crownstones all the time
					continue;
				}
				try {
					this.spheres[i].crownstones = await this.cloud.sphere(sphereId).crownstones();
				} catch(e) {
					this.log('Could not get crownstones for sphere: ' + sphereId, e);
				}
			}
		}
	}

	/**
	 * Extract rooms from the locations list. The location object is formatted as follows:
	 *
	 * ```
	 *   {
	 *     name: 'Living room',
	 *     uid: 2,
	 *     icon: 'fiCS1-living-room',
	 *     imageId: '$imageId',
	 *     id: '$sphereId',
	 *     createdAt: timestamp,
	 *     updatedAt: timestamp
	 *   }
	 * ```
	 */
	// REVIEW: Move to util
	extractRooms() {
		const roomList = [];
		if (!this.locations.length) {
			this.log('There are no locations found!');
			return roomList;
		}

		for (let i = 0; i < this.locations.length; i++) {
			let location = this.locations[i];
			let roomIcon = 'devices/' + location.icon + '.svg';
			const room = {
				name: location.name,
				id: location.id,
				icon: roomIcon
			};
			roomList.push(room);
		}
		this.log('List with rooms:', roomList);
		return roomList;
	}

	/**
	 * Extract users in a list in a way that is easier to manipulate.
	 */
	// REVIEW: Move to util
	extractUsers() {
		const userList = [];
		this.log('Get users from all spheres');
		if (!this.spheres.length) {
			this.log('There are no spheres found!');
		}

		for (let i = 0; i < this.spheres.length; ++i) {
			let users = this.spheres[i].users;
			if (!users) {
				this.log('No users in sphere: ', this.spheres[i].id);
				continue;
			}
			this.addUsersToList(userList, users.admins);
			this.addUsersToList(userList, users.members);
			this.addUsersToList(userList, users.guests);
		}

		if (userList.length > 0) {
			// add "any user" to the front of the list
			const anyUser = {
				name: 'Anybody',
				id: 'default',
			};
			userList.unshift(anyUser);
		} else {
			this.log('Unable to find users');
		}
		this.log('List with users:', userList);
		return userList;
	}

	/**
	 * This function pushes all users to the given userList, except for the ones that are already on the list.
	 */
	// REVIEW: Move to util
	addUsersToList(userList, users) {
		if (!users) return;

		for (let i = 0; i < users.length; i++) {
			const user = {
				name: users[i].firstName + ' ' + users[i].lastName,
				id: users[i].id,
			};
			// skip if already on list
			const checkId = item => item.id === user.id;
			if (userList.some(checkId)) {
				continue;
			}
			userList.push(user);
		}
	}

	/**
	 * Extract devices in a list in a way that can be presented by Homey.
	 */
	extractDevices() {
		const deviceList = [];
		this.log('Get devices from all spheres');
		if (!this.spheres.length) {
			this.log('There are no spheres found!');
		}

		for (let k = 0; k < this.spheres.length; ++k) {
			let sphereId = this.spheres[k].id;
			let crownstones = this.spheres[k].crownstones;

			for (let i = 0; i < crownstones.length; ++i) {
				let crownstone = crownstones[i];

				// can this Crownstone dim or not?
				crownstone.dimmerEnabled = false;
				for (let j = 0; j < crownstone.abilities.length; j++) {
					let ability = crownstone.abilities[j];
					if (ability.type === 'dimming') {
						if (ability.enabled) {
							crownstone.dimmerEnabled = true;
						}
						break;
					}
				}

				let deviceIcon = 'icons/' + crownstone.icon + '.svg';
				const device = {
					name: crownstone.name,
					data: {
						id: crownstone.id,
					},
					icon: deviceIcon,
					store: {
						address: crownstone.address,
						locked: crownstone.locked,
						dimmerEnabled: crownstone.dimmerEnabled,
						activeConnection: false,
						deleted: false,
						sphereId: sphereId,
					},
				};
				deviceList.push(device);
			}
		}
		return deviceList;
	}

	/**
	 * Get keys for a particular sphere. These are used for Bluetooth LE connections.
	 */
	// REVIEW: Move to BLE handling class if you don't want to remove this.
	extractKeys(sphereId) {
		this.log('Get keys for sphere ' + sphereId);
		if (!sphereId) {
			this.log('No such sphere');
			return;
		}

		if (!this.spheres.length) {
			this.log('There are no spheres found!');
		}

		for (let i = 0; i < this.spheres.length; ++i) {
			let sphere = this.spheres[i];
			if (sphereId === sphere.id) {
				if (sphere.keys) {
					this.log('Return keys for sphere');
					return sphere.keys;
				}
				this.log('Sphere does not contain keys!');
				return null;
			}
		}
		return null;
	}
}

module.exports = CrownstoneApp;
