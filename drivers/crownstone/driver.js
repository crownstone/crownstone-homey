const Homey = require('homey');

/**
 * The driver is called to list the devices when a user starts to use the app for the first time. It will query
 * the cloud for a list of Crownstone devices. For that it will get a particular sphere (indicated by the location
 * of the user's smartphone).
 *
 * Note that a connection to the Crownstone server is still required after several events:
 *   + A reboot of the Homey device means that all encryption keys are lost.
 *   + When an encryption key is changed.
 *
 * Normally, it would make sense to do this only once after a reboot (and retrieve a push message when the keys are
 * rotated). However, in this case that doesn't seem to be an option. Hence, to do this, we will make a connection
 * to the cloud to retrieve keys on every request from the user (if the keys are not set!). The location of this
 * is in the CrownstoneDevice rather than the CrownstoneDriver.
 */
class CrownstoneDriver extends Homey.Driver {
  /**
     * This method is called when the Driver is initialized.
     * */
  onInit() {
    this.log('Crownstone driver has been inited');
  }

  /**
     * This method is called when a user is adding a device
     * and the 'list_devices' view is called.
     */
  onPairListDevices(data, callback) {
    this.log('Start discovering Crownstones in cloud');
    Homey.app.getLocation((cloud, sphereId) => {
      getDevices(cloud, sphereId).catch((e) => { console.log('There was a problem obtaining the available devices:', e); });
    });

    /**
         * [todo] documentation
         */
    async function getDevices(cloud, sphereId) {
      const devices = await cloud.sphere(sphereId).crownstones();
      callback(null, listDevices(devices));
    }

    /**
         * This function returns a json list with all the devices in the sphere.
         */
    function listDevices(deviceList) {
      const devices = [];
      for (let i = 0; i < deviceList.length; i++) {
        const device = {
          name: deviceList[i].name,
          data: {
            id: deviceList[i].id,
          },
        };
        devices.push(device);
      }
      return devices;
    }
  }
}

module.exports = CrownstoneDriver;
