const Homey = require('homey');
const BleLib = require('../../blelib/Bluenet');

class CrownstoneDevice extends Homey.Device {
  /**
   * This method is called when the Device is initialized. It does not necessarily do any scanning itself.
   * It will obtain the cloud instance and the access token.
   */
  onInit() {
    this.log(this.getName()  + 'has been inited');
    this.log('Name:', this.getName());
    this.log('Class:', this.getClass());
    this.bluenet = new BleLib.default();
    this.cloud = Homey.app.getCloud();
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    //this.switchCrownstone().then(r => console.log('done'));
  }

  /**
   * Called when the device has requested a state change (turned on or off).
   */
  async onCapabilityOnoff(value) {
    let homeyAdvertisement = await this.findCrownstone();
    if (value) {
      await this.cloud.crownstone(this.getData().id).turnOn();
    } else if (!value) {
      await this.cloud.crownstone(this.getData().id).turnOff();
    }
  }

  /**
   * !- This function is only for testing purposes -!
   */
  async findCrownstone() {
    let uuid = this.getData().address.toLowerCase().replace(/:/g, '');
    let BleManager = Homey.ManagerBLE;
    let homeyAdvertisement = await BleManager.find(uuid, 10000).catch((e) => {
      this.log('There was a problem finding this Crownstone:', e);
    });
    if (homeyAdvertisement) {
      this.log('Found Crownstone:' + this.getName());
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
