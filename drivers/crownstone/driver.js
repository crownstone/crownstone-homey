'use strict';
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
    this.log('Crownstone driver has been initialized');
  }

  /**
   * This method will control the views which are shown to the user.
   * The session property passed in onPair can control the front-end programmatically.
   */
  async onPair(session) {

    /**
     * This part will determine what view to show the user based on if the user is already logged
     * in or not.
     */
    session.setHandler('showView', async (viewId) => {
      if (viewId === 'loading') {
        if (this.homey.app.loginState) {
          await session.showView('confirmation');
        } else {
          await session.showView('login_credentials');
        }
      }
      if (viewId === 'login_credentials') {
        this.homey.settings.set('email', '');
        this.homey.settings.set('password', '');
        this.homey.app.loginState = false;
      }
    });

    /**
     * This view will appear when the user is not yet logged in.
     */
    session.setHandler('login', async (data, callback) => {
      let loginState = await this.homey.app.setSettings(data.username, data.password);
      if (loginState) {
        await session.showView('loading');
      } else if (!loginState) {
        callback(null, false);
      }
    });

    /**
     * This view will appear when the user is logged in.
     */
    session.setHandler('list_devices', async (data) => {
      if (this.homey.app.checkMailAndPassword()) {
        console.log('Start discovering Crownstones in cloud..');
        let sphereId = await this.homey.app.getSphereId();
        let cloud = this.homey.app.cloud;
        let devices = await cloud.sphere(sphereId).crownstones().catch((e) => {
          throw new Error('Could not retrieve the Crownstones from the cloud.');
        })
        return listDevices(devices);
      } else {
        return [];
      }

      /**
       * This function returns a json list with all the devices and their name, ID and address in
       * the sphere.
       * It will also add the locked state, dim capability, an active value and a deleted value
       * when a device has been deleted.
       */
      function listDevices(deviceList) {
        let dimState = false;
        const devices = [];
        for (let i = 0; i < deviceList.length; i++) {
          for (let j = 0; j < deviceList[i].abilities.length; j++) {
            if (deviceList[i].abilities[j].type === 'dimming') {
              if (deviceList[i].abilities[j].enabled) {
                dimState = true;
              } else {
                dimState = false;
              }
            }
          }
          const device = {
            name: deviceList[i].name,
            data: {
              id: deviceList[i].id,
            },
            store: {
              address: deviceList[i].address,
              locked: deviceList[i].locked,
              dimmed: dimState,
              active: false,
              deleted: false,
            },
          };
          devices.push(device);
        }
        return devices;
      }
    });
  }
}

module.exports = CrownstoneDriver;
