'use strict';
const Homey = require('homey');
const BleLib = require('../../blelib/Bluenet');

let activeBleConnection = false;

class CrownstoneDevice extends Homey.Device {
	/**
	 * This method is called when the Device is initialized.
	 * It will obtain the cloud instance and the access token.
	 * It will query an update for all the devices in case their lock-state and dim-capability was
	 * changed.
	 */
	onInit() {

		this.id = this.getData().id;
		this.name = this.getName();

		// skip obtaining additional info if device has been deleted locally
		if (this.getStoreValue('deleted')) {
			this.log('Did not initialize "' + this.name + '" because it has been deleted.');
			return;
		}

		this.cloud = this.homey.app.cloud;
		this.bluenet = new BleLib.default();
		this.updateCrownstoneCapabilities().catch(this.error);
		this.updateCrownstoneState().catch(this.error);
		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
		this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
		let name = this.getName();
		this.log('Initialized "' + this.name + '" (id=' + this.id + ')');
	}

	/**
	 * Get all capabilities of a Crownstone from the cloud and set the corresponding values.
	 *
	 * Return struct with fields such as .locked and .type : 'dimming'
	 */
	async updateCrownstoneCapabilities() {
		if (!this.homey.app.loggedIn) {
			this.log("Not logged in yet, skip");
			return;
		}
		// get capabilities from the cloud
		let crownstoneCapabilities = await this.cloud.crownstone(this.id).data();

		// lock enabled
		let lockEnabled = crownstoneCapabilities.locked;
		//this.log('Set ' + this.name + ' as ' + (lockEnabled ? 'locked' : 'unlocked'));
		await this.changeLockState(lockEnabled);

		// dimmer enabled
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
		if (!this.homey.app.loggedIn) {
			this.log("Not logged in yet, skip");
			return;
		}

		// switch state
		let currentSwitchState = await this.cloud.crownstone(this.id).currentSwitchState();
		await this.changeOnOffStatus(currentSwitchState);
	}

	/**
	 * This method will lock or unlock the device depending on the state.
	 */
	async changeLockState(lockEnabled) {

		if (lockEnabled) {
			// REVIEW: This setting does not sound like something related to energy, whats the logic here?
			this.setSettings({ energy_alwayson: true });
			/*
			if (this.getAvailable()) {
				this.log('Lock ' + this.name);
				let msg = this.homey.__('lockedMessage');
				await this.setUnavailable(msg);
				await this.setStoreValue('locked', true);
			} else {
				this.log('Device ' + this.name + ' is already unavailable');
			}*/
		}
		else {
			this.setSettings({ energy_alwayson: false });
			/*
			if (!this.getAvailable()) {
				this.log('Unlock ' + this.name);
				await this.setStoreValue('locked', false);
				await this.setAvailable();
			} else {
				this.log('Device ' + this.name + ' is already available');
			}*/
		}
	}

	/**
	 * This method will add or remove the 'dim' capability.
	 */
	async changeDimCapability(capabilityEnabled) {
		let currentlyEnabled = this.getCapabilities().includes('dim');
		if (capabilityEnabled && !currentlyEnabled) {
			this.log('Set dimmer capability on ' + this.name);
			await this.setStoreValue('dimmerEnabled', true);
			// REVIEW: Why is this not awaited?
			this.addCapability('dim').catch(this.error);
		}
		if (!capabilityEnabled && currentlyEnabled) {
			this.log('Remove dimmer capability from ' + this.name);
			await this.setStoreValue('dimmerEnabled', false);
			// REVIEW: Why is this not awaited?
			this.removeCapability('dim').catch(this.error);
		}
	}

	/**
	 * This method will update the state of the device which is displayed in the Homey App.
	 * It will set the on/off state and dim state using the current state.
	 */
	async changeOnOffStatus(switchState) {
		if (this.getCapabilities().includes('dim')) {
			this.log('Set "' + this.name + '" to dim state ' + switchState);
			await this.setCapabilityValue('dim', switchState/100);
			return;
		}
		let turnOn = (switchState > 0);
		this.log('Set "' + this.name + '" to switch state ' + (turnOn ? 'ON' : 'OFF'));
		await this.setCapabilityValue('onoff', turnOn);
	}

	/**
	 * Called when the device has requested a state change (dimming).
	 * It will use the cloud to dim the Crownstone.
	 * todo: add Ble dimming functionality.
	 */
	async onCapabilityDim(dimValue) {
		if (!this.homey.app.loggedIn) {
			this.log("Not logged in yet");
			return;
		}
		let percentage = dimValue * 100;
		this.log("Set dimmer level in cloud to " + percentage);
		await this.cloud.crownstone(this.id).setSwitch(percentage);
	}

	/**
	 * Called when the device has requested a state change (turned on or off).
	 * It will use the Crownstone Cloud to switch the device, if that fails, it will use Ble instead.
	 */
	async onCapabilityOnoff(switchValue) {
		this.switchCrownstoneViaCloud(switchValue);

		if (!this.homey.app.bleActive) {
			this.log("Bluetooth is not enabled");
			return;
		}

		let activeConnection = this.getStoreValue('activeConnection');
		if (activeConnection) {
			this.log("Already an active connection");
			return;
		}
		await this.setStoreValue('activeConnection', true);
		this.log('Enable switch by Bluetooth LE');
		await this.switchCrownstoneByBLE(switchValue).catch(async (e) => {
			await this.bleError(e);
		});
		await this.setStoreValue('activeConnection', false);
	}

	/**
	 * This function displays an error message to the app and prevents repeating code.
	 */
	async bleError(error) {
		console.log('There was a problem switching the device using Ble:', error);
		//activeBleConnection = false;
		await this.setStoreValue('activeConnection', false);
		throw new Error('There was a problem switching the device.');
	}

	/**
	 * This method will switch the device using the Crownstone Cloud.
	 */
	async switchCrownstoneViaCloud(switchValue) {
		if (!this.homey.app.loggedIn) {
			this.log("Not logged in yet");
			return;
		}
		this.log("Set switch state in cloud to " + switchValue);

		if (switchValue) {
			this.log('Turn on "' + this.name + '"');
			await this.cloud.crownstone(this.id).turnOn();
		}
		else {
			this.log('Turn off "' + this.name + '"');
			await this.cloud.crownstone(this.id).turnOff();
		}
	}

	/**
	 * This method will switch the device using BLE.
	 */
	async switchCrownstoneByBLE(switchValue) {
		let sphereId = this.getStoreValue('sphereId');
		if (!sphereId) {
			this.log('Sphere id not known for the Crownstone');
			return;
		}
		this.getKeys(sphereId);
		
		let homeyAdvertisement = await this.findCrownstone();
		if (!homeyAdvertisement) {
			this.log('Crownstone cannot be found');
			return;
		}

		// REVIEW: This can throw, take some error handling into account.
		await this.bluenet.connect(homeyAdvertisement);
		await this.bluenet.control.setSwitchState((switchValue ? 1 : 0));
		await this.bluenet.control.disconnect();
		await this.bluenet.disconnect();
	}

	/**
	 * This method will obtain the user keys from the cloud and will load them to the Bluenet settings.
	 */
	// REVIEW: getKeys has a side effect: you load the keys into the lib. Change the function name to reflect what it does.
	getKeys(sphereId) {
		this.log('Obtaining the keys..');
		// get keys previously obtained from app
		let keys = this.homey.app.extractKeys(sphereId);
		if (!keys) {
			this.log('Cannot find keys');
			return;
		}
	
		let adminKey = null;
		let memberKey = null;
		let basicKey = null;
		for (let i = 0; i < keys.length; i++) {
			switch(keys[i].keyType) {
			case 'ADMIN_KEY':
				adminKey = keys[i].key;
				break;
			case 'MEMBER_KEY':
				memberKey = keys[i].key;
				break;
			case 'BASIC_KEY':
				basicKey = keys[i].key;
				break;
			}
		}

		if (!basicKey) {
			this.log('Need at least a basic key');
			return;
		}

		this.bluenet.settings.loadKeys(adminKey, memberKey, basicKey);
	}

	/**
	 * This function will return a Homey Advertisement using the Mac address of the device so that
	 * the Homey can make a connection with that device.
	 */
	async findCrownstone() {
		let uuid = this.getStoreValue('address').toLowerCase().replace(/:/g, '');
		let homeyAdvertisement = await this.homey.ble.find(uuid, 10000).catch((e) => {
			this.log('There was a problem finding this Crownstone:', e);
		});
		if (homeyAdvertisement) {
			this.log('Found Crownstone: ' + this.getName());
			return homeyAdvertisement;
		}
		else {
			this.log('Unable to find this Crownstone..');
			return null;
		}
	}

	/**
	 * this method is called when the Device is added.
	 */
	onAdded() {
		this.log(this.getName() + ' has been added.');
	}

	/**
	 * this method is called when the Device is deleted.
	 * */
	onDeleted() {
		this.log(this.getName() + ' has been deleted.');
	}
}

module.exports = CrownstoneDevice;
