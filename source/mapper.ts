import { Cache } from './cache';

/**
 * Maps structs to entities that Homey understands.
 *
 */
export class Mapper {

	cache: Cache;

	roomList: homey_Room[];
	userList: homey_User[];

	constructor(cache: Cache) {
		this.cache = cache;
		this.roomList = [];
		this.userList = [];
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
	extractRooms() {
		this.roomList = [];
		if (!this.cache.locationsAvailable()) {
			console.log('There are no locations found!');
			return this.roomList;
		}

		for (const locationId in this.cache.locations) {
			const location = this.cache.locations[locationId];
			let roomIcon = 'icons/' + location.icon + '.svg';
			const room = {
				name: location.name,
				id: location.id,
				icon: roomIcon
			};
			this.roomList.push(room);
		}
		console.log('List with rooms:', this.roomList);
		return this.roomList;
	}

	/**
	 * Extract users in a list in a way that is easier to manipulate.
	 */
	extractUsers() {
		this.userList = [];
		console.log('Get users from all spheres');
		if (!this.cache.spheresAvailable()) {
			console.log('There are no spheres found!');
			return;
		}

		// iterate over each sphere and add admins, members, and guests to the user list
		for (const sphereId in this.cache.sphereUsers) {
			const sphereUsers = this.cache.sphereUsers[sphereId];
			if (!sphereUsers) {
				console.log('No users in sphere: ' + sphereId);
				continue;
			}
			this.addUsersToList(this.userList, sphereUsers.admins);
			this.addUsersToList(this.userList, sphereUsers.members);
			this.addUsersToList(this.userList, sphereUsers.guests);
		}

		// return empty list if there are no users found
		if (this.userList.length == 0) {
			console.log('Unable to find users');
			return this.userList;
		}

		// add "any user" to the front of the list
		const anyUser = {
			name: 'Anybody',
			id: 'default',
		};
		this.userList.unshift(anyUser);
		console.log('List with users:', this.userList);
		return this.userList;
	}

	/**
	 * A helper function for extractUsers. This pushes all not-yet existing users to the given userList.
	 */
	addUsersToList(userList: homey_User[], users: cloud_UserData[]) {
		if (!users) return;

		for (let i = 0; i < users.length; i++) {
			const user = {
				name: users[i].firstName + ' ' + users[i].lastName,
				id: users[i].id,
			};
			// skip if already on list
			const checkId = (item: { id: string; }) => item.id === user.id;
			if (userList.some(checkId)) {
				continue;
			}
			userList.push(user);
		}
	}
	
	/**
	 * Extract Crownstone devices in a list in such a way that it can be presented by Homey.
	 */
	extractDevices() {
		const deviceList = [];
		console.log('Get devices from all spheres');
		if (!this.cache.spheresAvailable()) {
			console.log('There are no spheres found!');
		}

		for (const sphereId in this.cache.sphereStones) {
			const crownstones = this.cache.sphereStones[sphereId];

			for (let i = 0; i < crownstones.length; ++i) {
				let crownstone = crownstones[i];

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
						sphereId: sphereId,
					},
				};
				deviceList.push(device);
			}
		}
		return deviceList;
	}
	
	/**
	 * Operates on the roomList array in this class. Alternatively, we could get it out of the cache. However, this
	 * implementation makes it similar to userExists.
	 */
	roomIndex(roomId: string) {
		for (let i = 0; i < this.roomList.length; ++i) {
			if (this.roomList[i].id == roomId) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Operates on the userList array in this class. Alternatively, we could iterate over the cache (sphereUsers and
	 * then per sphere admins, users, guests, etc.). The latter is more cumbersome.
	 */
	userIndex(userId: string) {
		for (let i = 0; i < this.userList.length; ++i) {
			if (this.userList[i].id == userId) {
				return i;
			}
		}
		return -1;
	}

	roomExists(roomId: string) {
		return (this.roomIndex(roomId) >= 0);
	}

	userExists(userId: string) {
		return (this.userIndex(userId) >= 0);
	}
}


