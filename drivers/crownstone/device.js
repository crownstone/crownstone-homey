'use strict';
const Homey = require('homey');
const BleLib = require('../../blelib/Bluenet');

let activeConnection = false;

class CrownstoneDevice extends Homey.Device {
  /**
   * This method is called when the Device is initialized. It does not necessarily do any scanning itself.
   * It will obtain the cloud instance and the access token.
   */
  onInit() {
    this.log(this.getName() + ' has been inited');
    if (this.getData().dimmed) {
      this.addCapability('dim').catch(this.error);
    } else if (!this.getData().dimmed) {
      this.removeCapability('dim').catch(this.error);
    }
    this.bluenet = new BleLib.default();
    this.cloud = Homey.app.getCloud();
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    if (this.getData().locked) {
      this.setUnavailable('This device is locked.').catch(this.error);
    }
  }

  /**
   * This method will lock or unlock the device depending on the state.
   * todo: change available-setting to custom lock-capability.
   */
  async changeLockState(state) {
      if (state) {
        this.getData().locked = true;
        await this.setUnavailable('This device is locked.');
      } else if (!state) {
        this.getData().locked = false;
        await this.setAvailable();
      }
  }

  /**
   * Called when the device has requested a state change (turned on or off).
   * It will use Ble to switch the Crownstone, if that fails, it will use the cloud instead.
   */
  async onCapabilityOnoff(value) {
    if (!activeConnection && Homey.app.getLoginState()) {
      activeConnection = true;
      await this.switchBLE(value).catch(async (e) => {
        console.log('There was a problem switching the device:', e);
        if (value) {
          await this.cloud.crownstone(this.getData().id).turnOn();
        } else if (!value) {
          await this.cloud.crownstone(this.getData().id).turnOff();
        }
      });
      if (value) {
        await this.setCapabilityValue('dim', 1);
      } else if (!value) {
        await this.setCapabilityValue('dim', 0);
      }
      activeConnection = false;
    }
  }

  /**
   * Called when the device has requested a state change (dimming).
   * It will use the cloud to dim the Crownstone.
   * todo: add Ble switching functionality.
   */
  async onCapabilityDim(value) {
    if (!activeConnection && Homey.app.getLoginState()) {
      activeConnection = true;
      let percentage = value*100;
      if (percentage > 0) {
        await this.setCapabilityValue('onoff', true);
      } else if (percentage < 1) {
        await this.setCapabilityValue('onoff', false);
      }
      await this.cloud.crownstone(this.getData().id).setSwitch(percentage);
      activeConnection = false;
    }
  }

  /**
   * This method will switch the device using BLE.
   */
  async switchBLE(value) {
    this.state = 0;
    if (value == true) {
      this.state = 1;
    }
    await this.getKeys().catch((e) => {
      console.log('There was a problem obtaining the keys:', e);
    });
    let homeyAdvertisement = await this.findCrownstone();
    await this.bluenet.connect(homeyAdvertisement);
    await this.bluenet.control.setSwitchState(this.state);
    await this.bluenet.control.disconnect();
    await this.bluenet.disconnect();
  }

  /**
   * This method will obtain the user keys from the cloud and will load them to the Bluenet settings.
   */
  async getKeys() {
    if (this.bluenet.settings.adminKey !== null &&
        this.bluenet.settings.memberKey !== null &&
        this.bluenet.settings.basicKey !== null
    ) {
      this.log('The keys are already obtained');
    } else {
      this.log('Obtaining the keys..');
      let sphereId = await Homey.app.getSphereId();
      let keysInSphere = await this.cloud.sphere(sphereId).keys();
      let keyArray = keysInSphere.sphereKeys;
      for (let i = 0; i < keysInSphere.sphereKeys.length; i++) {
        if (keyArray[i].keyType === 'ADMIN_KEY') {
          this.adminKey = keyArray[i].key;
        } else if (keyArray[i].keyType === 'MEMBER_KEY') {
          this.memberKey = keyArray[i].key;
        } else if (keyArray[i].keyType === 'BASIC_KEY') {
          this.basicKey = keyArray[i].key;
        }
      }
      this.bluenet.settings.loadKeys(this.adminKey, this.memberKey, this.basicKey);
    }
  }

  /**
   * This function will return a Homey Advertisement using the Mac address of the device so that
   * the Homey can make a connection with that device.
   */
  async findCrownstone() {
    let uuid = this.getData().address.toLowerCase().replace(/:/g, '');
    let homeyAdvertisement = await Homey.ManagerBLE.find(uuid, 10000).catch((e) => {
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
    // todo register a capability listener for dimming if the Crownstone can be dimmed (use this.getData())
  }

  /**
   * this method is called when the Device is deleted.
   * */
  onDeleted() {
    this.log(this.getName() + ' has been deleted.');
  }
}

module.exports = CrownstoneDevice;
