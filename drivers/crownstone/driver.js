const Homey = require('homey');

/**
 * The driver is called to list the devices when a user starts to use the app for the first time. It will query
 * the cloud for a list of Crownstone devices. For that it will get a particular sphere (indicated by the location
 * of the user's smartphone).
 */
class CrownstoneDriver extends Homey.Driver {
  /**
   * This method is called when the Driver is initialized.
   */
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
     * This function will obtain all the data of the stones in the sphere.
     */
    async function getDevices(cloud, sphereId) {
      const devices = await cloud.sphere(sphereId).crownstones();
      callback(null, listDevices(devices));
    }

    /**
     * This function returns a json list with all the devices and their name, ID and address in the sphere.
     */
    function listDevices(deviceList) {
      const devices = [];
      for (let i = 0; i < deviceList.length; i++) {
        const device = {
          name: deviceList[i].name,
          data: {
            id: deviceList[i].id,
            address: deviceList[i].address,
          },
        };
        devices.push(device);
      }
      return devices;
    }
  }
}

module.exports = CrownstoneDriver;
