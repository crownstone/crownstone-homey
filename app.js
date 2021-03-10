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

		this.cloud = new cloudLib.CrownstoneCloud();
		this.sse = new sseLib.CrownstoneSSE();

		this.presenceTrigger = this.homey.flow.getTriggerCard('user_enters_room');
		this.presenceCondition = this.homey.flow.getConditionCard('user_presence');

		this.sphereId = '';
		this.userLocations = [];
		this.loginState = false;
		this.setupInProgress = false;

		this.log(`App ${this.homey.app.manifest.name.en} is running...`);
		this.email = this.homey.settings.get('email');
		this.password = this.homey.settings.get('password');
		this.cloudActive = this.homey.settings.get('cloud');
		this.bleActive = this.homey.settings.get('ble');
		if (!this.cloudActive && !this.bleActive) {
			this.homey.settings.set('cloud', true);
			this.homey.settings.set('ble', true);
		}
		if (this.checkMailAndPassword()) {
			this.setupConnections(this.email, this.password).catch((e) => {
				console.log('There was a problem making the connections:', e);
			});
			this.obtainUserLocations().catch((e) => {
				console.log('There was a problem repeating code:', e);
			});
		}

		this.homey.settings.on('set', function () {
			this.cloudActive = this.homey.settings.get('cloud');
			this.bleActive = this.homey.settings.get('ble');
		});

		/**
		 * This code runs when a trigger has been fired. If the room id and user id are equal, the flow will run.
		 */
		this.presenceTrigger.registerRunListener((args, state) =>
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
			} else {
				let userInList = this.checkUserId(args.users.id);
				if (userInList > -1) {
					return Promise.resolve(args.rooms.id === this.userLocations[userInList].locations[0]);
				}
				return false;
			}
		});

		/**
		 * This code runs when a flow is being constructed for a trigger-card, and a room should be selected.
		 * This code returns a list of rooms in a sphere which is shown to the user.
		 */
		this.presenceTrigger.getArgument('rooms').registerAutocompleteListener(() =>
			Promise.resolve(this.getRooms().catch((e) => {
				console.log('There was a problem obtaining the rooms:', e);
			})));

		/**
		 * This code runs when a flow is being constructed for a trigger-card, and a user should be selected.
		 * This code returns a list of users in a sphere.
		 */
		this.presenceTrigger.getArgument('users').registerAutocompleteListener(() =>
			Promise.resolve(this.getUsers().catch((e) => {
				console.log('There was a problem obtaining the users:', e);
			})));

		/**
		 * This code runs when a flow is being constructed for a condition-card, and a room should be selected.
		 * This code returns a list of rooms in a sphere.
		 */
		this.presenceCondition.getArgument('rooms').registerAutocompleteListener(() =>
			Promise.resolve(this.getRooms().catch((e) => {
				console.log('There was a problem obtaining the rooms:', e);
			})));

		/**
		 * This code runs when a flow is being constructed for a condition-card, and a user should be selected.
		 * This code returns a list of users in a sphere.
		 */
		this.presenceCondition.getArgument('users').registerAutocompleteListener(() =>
			Promise.resolve(this.getUsers().catch((e) => {
				console.log('There was a problem obtaining the users:', e);
			})));
	}

	/**
	 * This function will be called when a user changes the credentials in the settings page.
	 */
	async setSettings(email, password) {
		this.homey.app.email = email;
		this.homey.app.password = password;
		if (this.checkMailAndPassword()) {
			await this.setupConnections(email, password).catch((e) => {
				console.log('There was a problem making the connections:', e);
			});
			this.homey.settings.set('email', email);
			this.homey.settings.set('password', password);
			return this.loginState;
		}
		this.homey.settings.set('email', '');
		this.homey.settings.set('password', '');
		this.loginState = false;
		return this.loginState;
	}

	/**
	 * This method will call the obtainSphereId function and returns the sphere ID.
	 */
	async getSphereId() {
		await this.obtainSphereId(() => { }).catch((e) => {
			console.log('There was a problem getting the sphere ID:', e);
		});
		return this.sphereId;
	}

	/**
	 * This function will check if the email or password is either empty, null or undefined, and will
	 * return a boolean.
	 */
	checkMailAndPassword() {
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
		this.loginState = true;
		this.setupInProgress = true;
		await this.cloud.loginHashed(email, password).catch((e) => {
			console.log('There was a problem making a connection to the cloud:', e);
			this.loginState = false;
		});
		await this.getPresentPeople();
		await this.loginToEventServer(email, password).catch((e) => {
			console.log('There was a problem making a connection with the event server:', e);
		});
		this.setupInProgress = false;
	}

	/**
	 * This function will obtain all the users and their locations in the sphere.
	 */
	async getPresentPeople() {
		if (this.loginState) {
			await this.obtainSphereId(() => {
			}).catch((e) => {
				console.log('There was a problem getting the sphere ID:', e);
			});
			if (typeof this.sphereId !== 'undefined') {
				this.userLocations = await this.cloud.sphere(this.sphereId).presentPeople();
			}
		}
	}

	/**
	 * This function will obtain the sphere and, if available, the room where the user is currently located.
	 */
	async obtainSphereId(callback) {
		const userReference = await this.cloud.me();
		const userLocation = await userReference.currentLocation();
		if (userLocation.length > 0) {
			const spheres = await this.cloud.spheres();
			if (spheres.length > 0) {
				this.sphereId = userLocation[0].inSpheres[0].sphereId;
				callback();
			} else {
				console.log('Unable to find sphere');
			}
		} else {
			console.log('Unable to locate user');
		}
	}

	/**
	 * This function will call the getPresentPeople-function every 30 minutes in case of missed events.
	 */
	async obtainUserLocations() {
		setInterval(() => {
			this.getPresentPeople();
		}, 1000 * 1800); // 30 minutes
	}

	/**
	 * This function will stop all running eventHandlers, in case a user enters other credentials,
	 * make a new connection with the sse-server and starts the eventHandler.
	 */
	async loginToEventServer(email, password) {
		await this.sse.stop();
		await this.sse.loginHashed(email, password);
		await this.sse.start(this.eventHandler);
		await this.getPresentPeople();
	}

	/**
	 * The eventHandler receives events from the sse-server and fires the runTrigger-function
	 * when a user enters or leaves a room.
	 * todo: when the state of a Crownstone changes outside of the app, update the capabilityValue.
	 */
	eventHandler = (data) => {
		if (data.type === 'presence' && data.subType === 'enterLocation') {
			this.runTrigger(data, true).catch((e) => {
				console.log('There was a problem firing the trigger:', e);
			});
		}
		if (data.type === 'presence' && data.subType === 'exitLocation') {
			this.runTrigger(data, false).catch((e) => {
				console.log('There was a problem firing the trigger:', e);
			});
		}
		if (data.type === 'dataChange' && data.subType === 'stones' && data.operation === 'update') {
			let deviceId = data.changedItem.id;
			this.getAndSetLockedState(deviceId).catch(this.error);
		}
		if (data.type === 'dataChange' && data.subType === 'stones' && data.operation === 'delete') {
			let deviceId = data.changedItem.id;
			this.deleteDevice(deviceId).catch(this.error);
		}
		if (data.type === 'abilityChange' && data.subType === 'dimming') {
			let deviceId = data.stone.id;
			let dimAbilityState = data.ability.enabled;
			this.setDimmingAbilityState(deviceId, dimAbilityState).catch(this.error);
		}
	};

	/**
	 * This function will obtain the state of the dimming capability of the device, compare the
	 * device ID with that of all the added devices, and will call the function to update the
	 * dimming capability when a match has been found.
	 */
	async setDimmingAbilityState(deviceId, dimAbilityState) {
		let crownstoneDriver = this.homey.drivers.getDriver('crownstone');
		let devices = crownstoneDriver.getDevices();
		devices.forEach(device => {
			if (device.getData().id === deviceId) {
				this.updateDimCapability(device, dimAbilityState).catch((e) => {
					console.log('There was a problem updating the dimming capability of a device:', e);
				});
			}
		});
	}

	/**
	 * This function will call the device's method to change the dimming capability.
	 */
	async updateDimCapability(device, state) {
		await device.changeDimCapability(state)
	}

	/**
	 * This function will obtain the locked state of the device, compare the device ID with that of all
	 * the added devices, and will call the function to update the locked state when a match has been
	 * found.
	 */
	async getAndSetLockedState(deviceId) {
		let crownstoneData = await this.cloud.crownstone(deviceId).data();
		let lockedState = crownstoneData.locked;
		let crownstoneDriver = this.homey.drivers.getDriver('crownstone');
		let devices = crownstoneDriver.getDevices();
		devices.forEach(device => {
			if (device.getData().id === deviceId) {
				this.updateLockedState(device, lockedState).catch((e) => {
					console.log('There was a problem updating the locked state of a device:', e);
				});
			}
		});
	}

	/**
	 * This function will call the device's method to change the locked state.
	 */
	async updateLockedState(device, state) {
		await device.changeLockState(state);
	}

	/**
	 * This function will set the device as unavailable, since there is no method to delete a device from
	 * the app yet.
	 */
	async deleteDevice(deviceId) {
		let crownstoneDriver = this.homey.drivers.getDriver('crownstone');
		let devices = crownstoneDriver.getDevices();
		devices.forEach(device => {
			if (device.getData().id === deviceId) {
				this.setDeviceUnavailable(device).catch((e) => {
					console.log('There was a problem setting the device unavailable:', e);
				})
			}
		});
	}

	/**
	 * This function will change the available state of the device and update it's delete value.
	 */
	async setDeviceUnavailable(device) {
		await device.setUnavailable('This device has been deleted.');
		await device.setStoreValue('deleted', true);
	}

	/**
	 * This function will update the userLocations-list and will fire the trigger after it is complete.
	 */
	async runTrigger(data, entersRoom) {
		const state = {userId: data.user.id, locationId: data.location.id};
		await this.updateUserLocationList(entersRoom, data.user.id, data.location.id);
		if (entersRoom) {
			this.presenceTrigger.trigger(null, state).catch((e) => {
				console.log('Something went wrong:', e);
			});
		}
	}

	/**
	 * This function will update the userLocations-list by using events.
	 * To fix missed events: If an ID is missing or is the same as the newer ID,
	 * the getPresentPeople-function will be called to refresh the list.
	 */
	async updateUserLocationList(entersRoom, userId, location) {
		let userInList = this.checkUserId(userId);
		if (entersRoom) {
			if (userInList < 0) {
				const userLocation = {
					userId: userId,
					locations: [location],
				};
				this.userLocations.push(userLocation);
			} else {
				if (this.userLocations[userInList].locations[0] === location) {
					this.getPresentPeople(() => {
					}).catch((e) => {
						console.log('There was a problem getting the locations of the users:', e);
					});
				} else {
					this.userLocations[userInList].locations[0] = location;
				}
			}
		} else if (!entersRoom) {
			if (userInList > -1) {
				if (this.userLocations[userInList].locations[0] !== location) {
					return;
				}
			}
			this.getPresentPeople(() => {
			}).catch((e) => {
				console.log('There was a problem getting the locations of the users:', e);
			});
		}
	}

	/**
	 * This function will check if the userId is already defined in the list of userLocations and returns the index.
	 */
	checkUserId(userId) {
		for (let i = 0; i < this.userLocations.length; i++) {
			if (this.userLocations[i].userId === userId) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * This function will check if the roomId exists in the list of userLocations and returns a boolean.
	 */
	checkRoomId(roomId) {
		for (let i = 0; i < this.userLocations.length; i++) {
			if (this.userLocations[i].locations[0] === roomId) {
				return true;
			}
		}
		return false;
	}

	/**
	 * This function obtains all the rooms of the sphere where the user is currently located in.
	 */
	async getRooms() {
		if (this.checkMailAndPassword()) {
			await this.obtainSphereId(() => {
			}).catch((e) => {
				console.log('There was a problem getting the sphere Id:', e);
			});
			const rooms = await this.cloud.sphere(this.sphereId).locations();
			if (rooms.length > 0) {
				return this.listRooms(rooms);
			}
			console.log('Unable to find any rooms');
			return [];
		}
		return [];
	}

	/**
	 * This function returns a json list with all the rooms in the sphere.
	 * [todo:] add custom icons
	 */
	listRooms(rooms) {
		const roomList = [];
		for (let i = 0; i < rooms.length; i++) {
			const room = {
				name: rooms[i].name,
				id: rooms[i].id,
			};
			roomList.push(room);
		}
		return roomList;
	}

	/**
	 * This function will ask for the sphere Id and return a list of all the users in the sphere.
	 */
	async getUsers() {
		if (this.checkMailAndPassword()) {
			await this.obtainSphereId(() => {
			}).catch((e) => {
				console.log('There was a problem getting the sphere Id:', e);
			});
			const users = await this.cloud.sphere(this.sphereId).users();
			return this.listUsers(users);
		}
		return [];
	}

	/**
	 * This function returns a list of all the users in the sphere.
	 * A default user 'somebody' is added to use in a card which will be accepted with every user check.
	 */
	listUsers(users) {
		const userList = [];
		const defaultUser = {
			name: 'Somebody',
			id: 'default',
		};
		userList.push(defaultUser);
		this.addUserToList(userList, users.admins);
		this.addUserToList(userList, users.members);
		this.addUserToList(userList, users.guests);
		if (userList.length > 1) {
			return userList;
		}
		console.log('Unable to find any users');
		return [];
	}

	/**
	 * This function pushes json objects of the users to a user list.
	 */
	addUserToList(userList, users) {
		for (let i = 0; i < users.length; i++) {
			const user = {
				name: users[i].firstName + ' ' + users[i].lastName,
				id: users[i].id,
			};
			userList.push(user);
		}
	}

}

module.exports = CrownstoneApp;
