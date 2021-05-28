/**
 * Manage devices.
 */
export class DeviceManager {

	homey: any;

	constructor(homey: any) {
		this.homey = homey;
	}

	getInternationalizedMessage(messageId: string) {
		// @ts-ignore
		return this.homey.__(messageId);
	}

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
		let device = null;
		try {
			device = driver.getDevice(data);
		} catch(e) {
			console.log('Driver error for device ' + deviceId + ' (likely not known)');
		}
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
		try {
			console.log('Set device to deleted/unavailable');
			await device.setUnavailable(msg);
			await device.setStoreValue('deleted', true);
		} catch(e) {
			console.log(e);
		}
	}

	/**
	 * Add a new device.
	 */
	async addDevice(deviceId: string) {
		// the user has to add a device manually
		console.log("Homey does not allow the software to automatically add a device");
	}
}
