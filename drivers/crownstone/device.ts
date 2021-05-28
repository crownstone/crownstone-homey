import Homey from 'homey';

class CrownstoneDevice extends Homey.Device implements crownstone_Device {

	id: string;
	name: string;
	app: crownstone_App;

	/**
	 * The device initialization procedure will query app.cloud for data about the device capabilities, for example 
	 * dim capability and lock state.
	 */
	async onInit() {
		// @ts-ignore
		this.id = this.getData().id;
		this.name = this.getName();

		// skip obtaining additional info if device has been deleted locally
		if (this.getStoreValue('deleted')) {
			console.log('Did not initialize "' + this.name + '" because it has been deleted.');
			return;
		}

		// @ts-ignore
		this.app = this.homey.app;
		await this.updateCrownstoneCapabilities();
		await this.updateCrownstoneState();
		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
		this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
		console.log('Initialized "' + this.name + '" (id=' + this.id + ')');
	}

	/**
	 * Get all capabilities of a Crownstone from the cloud and set the corresponding values.
	 *
	 * Return struct with fields such as .locked and .type : 'dimming'
	 */
	async updateCrownstoneCapabilities() {
		if (!this.app.loggedIn) {
			console.log("Not logged in yet, skip");
			return;
		}
		// get capabilities from the cloud
		let crownstoneCapabilities = await this.app.cloud.crownstone(this.id).data();

		// set lock to enabled/disabled
		let lockEnabled = crownstoneCapabilities.locked;
		console.log('Set ' + this.name + ' as ' + (lockEnabled ? 'locked' : 'unlocked'));
		await this.changeLockState(lockEnabled);

		// set dimmer to enabled/disabled
		for (let i = 0; i < crownstoneCapabilities.abilities.length; i++) {
			let capability = crownstoneCapabilities.abilities[i];
			if (capability.type === 'dimming') {
				await this.changeDimCapability(capability.enabled);
				break;
			}
		}
	}

	/**
	 * Get the state of a Crownstone from a cloud and update the Homey app with this state information.
	 */
	async updateCrownstoneState() {
		if (!this.app.loggedIn) {
			console.log("Not logged in yet, skip");
			return;
		}

		// switch state
		let currentSwitchState = await this.app.cloud.crownstone(this.id).currentSwitchState();
		await this.changeOnOffStatus(currentSwitchState);
	}

	/**
	 * This method will lock or unlock the device depending on the state.
	 *
	 * Currently, the "energy_alwayson" setting is meant for outlets to be always on. It is not exactly the same as
	 * the Crownstone "lock" (which can also lock at an "always off" state. However, it is the closest function
	 * within Homey towards this option and will prevent bugs or user mistakes in Homey flows.
	 */
	async changeLockState(lockEnabled: boolean) {
		try {
			await this.setSettings({ energy_alwayson: lockEnabled });
		}
		catch(e) {
			console.log('Error with setting lock function');
		}
	}

	/**
	 * This method will add or remove the 'dim' capability.
	 */
	async changeDimCapability(capabilityEnabled: boolean) {
		let currentlyEnabled = this.getCapabilities().includes('dim');
		if (capabilityEnabled) {
			if (currentlyEnabled) {
				console.log('Dimmer already enabled for ' + this.name);
				return;
			}
			console.log('Set dimmer capability on ' + this.name);
			try {
				await this.setStoreValue('dimmerEnabled', true);
				await this.addCapability('dim');
			}
			catch(e) {
				console.log('Error with setting dimming on the Homey');
				throw e;
			}
		}
		else {
			if (!currentlyEnabled) {
				console.log('Dimmer already disabled for ' + this.name);
				return;
			}
			console.log('Remove dimmer capability from ' + this.name);
			try {
				await this.setStoreValue('dimmerEnabled', false);
				await this.removeCapability('dim');
			}
			catch(e) {
				console.log('Error with removing dimming for this device on the Homey');
				throw e;
			}
		}
	}

	/**
	 * This method will update the state of the device which is displayed in the Homey App.
	 * It will set the on/off state and dim state using the current state.
	 */
	async changeOnOffStatus(switchState: number) {
		if (this.getCapabilities().includes('dim')) {
			console.log('Set "' + this.name + '" to dim state ' + switchState);
			await this.setCapabilityValue('dim', switchState/100);
			// we will also turn it on/off as well
			// return;
		}
		let turnOn = (switchState > 0);
		console.log('Set "' + this.name + '" to switch state ' + (turnOn ? 'ON' : 'OFF'));
		await this.setCapabilityValue('onoff', turnOn);
	}

	/**
	 * Called when the device has requested a state change (dimming).
	 * It will use the cloud to dim the Crownstone.
	 */
	async onCapabilityDim(dimValue: number) {
		if (!this.app.loggedIn) {
			console.log("Not logged in yet");
			return;
		}
		let percentage = dimValue * 100;
		console.log("Set dimmer level in cloud to " + percentage);
		await this.app.cloud.crownstone(this.id).setSwitch(percentage);
	}

	/**
	 * Called when the device has requested a state change (turned on or off).
	 * It will use the Crownstone Cloud to switch the device.
	 */
	async onCapabilityOnoff(switchValue: number) {
		if (!this.app.loggedIn) {
			console.log("Not logged in yet");
			return;
		}
		console.log("Set switch state in cloud to " + switchValue);

		if (switchValue) {
			console.log('Turn on "' + this.name + '"');
			await this.app.cloud.crownstone(this.id).turnOn();
		}
		else {
			console.log('Turn off "' + this.name + '"');
			await this.app.cloud.crownstone(this.id).turnOff();
		}
	}

	/**
	 * Homey has added the device, just log.
	 */
	//onAdded() {
	//	console.log(this.getName() + ' has been added.');
	//}

	/**
	 * Homey has deleted the device, just log.
	 */
	onDeleted() {
		console.log(this.getName() + ' has been deleted.');
	}
}

module.exports = CrownstoneDevice;
