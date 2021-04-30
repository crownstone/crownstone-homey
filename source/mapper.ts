import { SlowCache } from './slowCache';
import { FastCache } from './fastCache';

/**
 * Maps structs to entities that Homey understands. Gets them from the slow cache and stores them in the fast cache.
 *
 */
export class Mapper {

	slowCache: SlowCache;
	fastCache: FastCache;

	constructor(slowCache: SlowCache, fastCache: FastCache) {
		this.slowCache = slowCache;
		this.fastCache = fastCache;
	}

	/**
	 * Map rooms from the locations list. The location object is formatted as follows:
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
	mapRooms() {
		// clear cache
		this.fastCache.roomList = [];

		if (!this.slowCache.locationsAvailable()) {
			console.log('There are no locations found!');
			return false;
		}

		for (const locationId in this.slowCache.locations) {
			const location = this.slowCache.locations[locationId];
			let roomIcon = 'icons/' + location.icon + '.svg';
			const room = {
				name: location.name,
				id: location.id,
				icon: roomIcon
			};
			this.fastCache.roomList.push(room);
		}
		console.log('List with rooms:', this.fastCache.roomList);
		return true;
	}

	/**
	 * Map users in a list in a way that is easier to manipulate.
	 */
	mapUsers() {
		// clear cache
		this.fastCache.userList = [];

		console.log('Get users from all spheres');
		if (!this.slowCache.spheresAvailable()) {
			console.log('There are no spheres found!');
			return false;
		}

		// iterate over each sphere and add admins, members, and guests to the user list
		for (const sphereId in this.slowCache.sphereUsers) {
			const sphereUsers = this.slowCache.sphereUsers[sphereId];
			if (!sphereUsers) {
				console.log('No users in sphere: ' + sphereId);
				continue;
			}
			this._addUsersToList(this.fastCache.userList, sphereUsers.admins);
			this._addUsersToList(this.fastCache.userList, sphereUsers.members);
			this._addUsersToList(this.fastCache.userList, sphereUsers.guests);
		}

		// return empty list if there are no users found
		if (this.fastCache.userList.length == 0) {
			console.log('Unable to find users');
			return this.fastCache.userList;
		}

		// add "any user" to the front of the list
		const anyUser = {
			name: 'Anybody',
			id: 'default',
		};
		this.fastCache.userList.unshift(anyUser);
		console.log('List with users:', this.fastCache.userList);
		return true;
	}

	/**
	 * A helper function for mapUsers. This pushes all not-yet existing users to the given userList.
	 */
	_addUsersToList(userList: homey_User[], users: cloud_UserData[]) {
		if (!users) return;

		for (let i = 0; i < users.length; i++) {
			const user = {
				name: users[i].firstName + ' ' + users[i].lastName,
				id: users[i].id,
			};
			// skip if already on list
			const checkId = (item: { id: string }) => { return item.id === user.id; }
			if (userList.some(checkId)) {
				continue;
			}
			userList.push(user);
		}
	}
	
	/**
	 * Map Crownstone devices in such a way that it can be presented by Homey.
	 */
	mapDevices(): boolean {
		// clear cache
		this.fastCache.deviceList = [];

		console.log('Get devices from all spheres');
		if (!this.slowCache.spheresAvailable()) {
			console.log('There are no spheres found!');
			return false;
		}

		for (const sphereId in this.slowCache.sphereStones) {
			// do just ignore result for now, empty spheres are fine
			this.mapDevicesInSphere(sphereId);
		}
		return true;
	}

	/**
	 * Map Crownstone devices for a particular sphere
	 */
	mapDevicesInSphere(sphereId: string): boolean {
		const crownstones = this.slowCache.sphereStones[sphereId];
		if (!crownstones) {
			console.log('No devices in sphere' + sphereId);
			return false;
		}

		for (let i = 0; i < crownstones.length; ++i) {
			let crownstone = crownstones[i];
			let device = this._getDevice(crownstone);
			this.fastCache.deviceList.push(device);
		}
		return true;
	}

	/**
	 * Map only a specific Crownstone. This is not efficient to use in a loop. Use mapDevicesInSphere for this.
	 * However, it is more efficient if you only need to update a single Crownstone.
	 */
	mapDeviceInSphere(sphereId: string, deviceId: string): boolean {
		const crownstones = this.slowCache.sphereStones[sphereId];
		if (!crownstones) {
			console.log('No devices in sphere' + sphereId);
			return false;
		}

		for (let i = 0; i < crownstones.length; ++i) {
			let crownstone = crownstones[i];
			if (crownstone.id != deviceId) {
				continue;
			}

			let device = this._getDevice(crownstone);
			this.fastCache.updateDevice(device);
		}
		return true;
	}

	_getDevice(crownstone: any): homey_Device {
		// get dimming ability from abilities (default false)
		let dimmingEnabled = false;
		if (crownstone.abilities) {
			for (let j = 0; j < crownstone.abilities.length; j++) {
				let ability = crownstone.abilities[j];
				if (ability.type === 'dimming') {
					if (ability.enabled) {
						dimmingEnabled = true;
					}
					break;
				}
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
				dimmerEnabled: dimmingEnabled,
				activeConnection: false,
				deleted: false,
				sphereId: crownstone.sphereId,
			},
		};
		return device;
	}
}


