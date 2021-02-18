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
    this.changeLockState(this.getStoreValue('locked')).catch(this.error);
    this.changeDimCapability(this.getStoreValue('dimmed')).catch(this.error);

    this.cloud = Homey.app.getCloud();
    this.bluenet = new BleLib.default();
    this.checkCsData().catch(this.error);
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
    this.log(this.getName() + ' has been initialized.');
  }

  /**
   * This method will update the lock-state and dim-capability of the device using the cloud.
   * This is in case data has changed while the Homey was inactive.
   * The method will wait until all the connections in the App are settled before querying to the
   * cloud.
   */
  async checkCsData() {
    await this.setStoreValue('active', false);
    let waitOnSetup = setInterval(async () => {
      if (!Homey.app.getSetupInProgress()) {
        clearInterval(waitOnSetup);
        if (Homey.app.getLoginState()) {
          let crownstoneData = await this.cloud.crownstone(this.getData().id).data();
          let lockedState = crownstoneData.locked;
          await this.changeLockState(lockedState);
          let dimState = crownstoneData.abilities[0].enabled;
          await this.changeDimCapability(dimState);
          let currentSwitchState = await this.cloud.crownstone(this.getData().id).currentSwitchState();
          await this.changeOnOffStatus(currentSwitchState);
        }
      }
    }, 1000);
  }

  /**
   * This method will lock or unlock the device depending on the state.
   * todo: change available-setting to custom lock-capability.
   */
  async changeLockState(state) {
      if (state && this.getAvailable()) {
        await this.setStoreValue('locked', true);
        await this.setUnavailable('This device is locked.');
      } else if (!state && !this.getAvailable()) {
        await this.setStoreValue('locked', false);
        await this.setAvailable();
      }
  }

  /**
   * This method will add or remove the 'dim' capability depending on the state.
   */
  async changeDimCapability(state) {
    if (state && !this.getCapabilities().includes('dim')) {
      await this.setStoreValue('dimmed', true);
      this.addCapability('dim').catch(this.error);
    } else if (!state && this.getCapabilities().includes('dim')) {
      await this.setStoreValue('dimmed', false);
      this.removeCapability('dim').catch(this.error);
    }
  }

  /**
   * todo: add documentation.
   */
  async changeOnOffStatus(switchState) {
    if (switchState > 0) {
      await this.setCapabilityValue('onoff', true);
    } else if (switchState < 1) {
      await this.setCapabilityValue('onoff', false);
    }
    if (this.getCapabilities().includes('dim')) {
      await this.setCapabilityValue('dim', switchState/100);
    }
  }

  /**
   * Called when the device has requested a state change (dimming).
   * It will use the cloud to dim the Crownstone.
   * todo: add Ble dimming functionality and ability to switch between cloud/ble.
   */
  async onCapabilityDim(value) {
    let active = this.getStoreValue('active');
    if (!active && Homey.app.getLoginState()) {
      await this.setStoreValue('active', true);
      let percentage = value*100;
      if (percentage > 0 && percentage < 10) { percentage = 10; }
      if (percentage > 0) {
        await this.setCapabilityValue('onoff', true);
      } else if (percentage < 1) {
        await this.setCapabilityValue('onoff', false);
      }
      await this.cloud.crownstone(this.getData().id).setSwitch(percentage);
      await this.setStoreValue('active', false);
    }
  }

  /**
   * Called when the device has requested a state change (turned on or off).
   * It will use the Crownstone Cloud to switch the device, if that fails, it will use Ble instead.
   */
  async onCapabilityOnoff(value) {
    let active = this.getStoreValue('active');
    if (!active && Homey.app.getLoginState()) {
      await this.setStoreValue('active', true);
      if (Homey.app.getCloudState()) {
        await this.switchCloud(value).catch(async (e) => {
          console.log('There was a problem switching the device using the Cloud:', e);
          if (Homey.app.getBleState() && !activeBleConnection) {
            activeBleConnection = true;
            console.log('Retry connection using Ble..');
            await this.switchBLE(value).catch(async (e) => {
              await this.bleError(e);
            });
          }
        });
      } else if (Homey.app.getBleState() && !activeBleConnection) {
        activeBleConnection = true;
        await this.switchBLE(value).catch(async (e) => {
          await this.bleError(e);
        });
      }
      if (this.getCapabilities().includes('dim')) {
        if (value) {
          await this.setCapabilityValue('dim', 1);
        } else if (!value) {
          await this.setCapabilityValue('dim', 0);
        }
      }
      activeBleConnection = false;
      await this.setStoreValue('active', false);
    }
  }

  /**
   * This function displays an error message to the app and prevents repeating code.
   */
  async bleError(error) {
    console.log('There was a problem switching the device using Ble:', error);
    activeBleConnection = false;
    await this.setStoreValue('active', false);
    throw new Error('There was a problem switching the device.');
  }

  /**
   * This method will switch the device using the Crownstone Cloud.
   */
  async switchCloud(value) {
    if (value) {
      await this.cloud.crownstone(this.getData().id).turnOn();
    } else if (!value) {
      await this.cloud.crownstone(this.getData().id).turnOff();
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
    if (homeyAdvertisement !== null) {
      await this.bluenet.connect(homeyAdvertisement);
      await this.bluenet.control.setSwitchState(this.state);
      await this.bluenet.control.disconnect();
      await this.bluenet.disconnect();
    }
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
    let uuid = this.getStoreValue('address').toLowerCase().replace(/:/g, '');
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
  }

  /**
   * this method is called when the Device is deleted.
   * */
  onDeleted() {
    this.log(this.getName() + ' has been deleted.');
  }
}

module.exports = CrownstoneDevice;
