/**
 * Fast cache (for quick access by Homey entities).
 */
export class FastCache {
	roomList: homey_Room[] = [];
	userList: homey_User[] = [];
	deviceList: homey_Device[] = [];

	constructor() {
	}
	
	/**
	 * Operates on the roomList array in the fast cache. Alternatively, we could get it out of the slow cache.
	 * However, this implementation makes it similar to userExists.
	 */
	roomIndex(roomId: string): number {
		for (let i = 0; i < this.roomList.length; ++i) {
			if (this.roomList[i].id == roomId) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Operates on the userList array in the fast cache. Alternatively, we could iterate over the slow cache
	 * (sphereUsers and then per sphere admins, users, guests, etc.). The latter is more cumbersome.
	 */
	userIndex(userId: string): number {
		for (let i = 0; i < this.userList.length; ++i) {
			if (this.userList[i].id == userId) {
				return i;
			}
		}
		return -1;
	}
	
	/**
	 * Operates on the deviceList array in the fast cache. Alternatively, we could iterate over the slow cache
	 * (sphereUsers and then per sphere admins, devices, guests, etc.). The latter is more cumbersome.
	 */
	deviceIndex(deviceId: string): number {
		for (let i = 0; i < this.deviceList.length; ++i) {
			if (this.deviceList[i].data.id == deviceId) {
				return i;
			}
		}
		return -1;
	}

	roomExists(roomId: string): boolean {
		return (this.roomIndex(roomId) >= 0);
	}

	userExists(userId: string): boolean {
		return (this.userIndex(userId) >= 0);
	}

	deviceExists(deviceId: string): boolean {
		return (this.deviceIndex(deviceId) >= 0);
	}

	/**
	 * Update device or create a new
	 */
	updateDevice(device: homey_Device) {
		let index = this.deviceIndex(device.data.id);
		if (index >= 0) {
			this.deviceList[index] = device;
		} else {
			this.deviceList.push(device);
		}
	}
}

