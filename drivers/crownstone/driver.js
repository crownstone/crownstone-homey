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
   * This method will control the views which are shown to the user which the socket as the
   * PairSocket.
   */
  onPair(socket) {

    /**
     * This part will determine what view to show the user based on if the user is already logged
     * in or not.
     */
    socket.on('showView', ( viewId, callback ) => {
      callback();
      if (viewId === 'loading') {
        if (Homey.app.getLoginState()) {
          socket.showView('confirmation');
        } else {
          socket.showView('login_credentials');
        }
      }
      if (viewId === 'login_credentials') {
        Homey.ManagerSettings.set('email', '');
        Homey.ManagerSettings.set('password', '');
        Homey.app.setLoginState(false);
      }
    });

    /**
     * This view will appear when the user is not yet logged in.
     */
    socket.on('login', (data, callback) => {
      return Homey.app.setSettings(data.username, data.password)
          .then((loginState) => {
            if (loginState) {
              socket.showView('loading');
            } else if (!loginState) {
              callback(null, false);
            }
          });
    });

    /**
     * This view will appear when the user is logged in.
     */
    socket.on('list_devices', function (data, callback) {
      if (Homey.app.checkMailAndPass()) {
        console.log('Start discovering Crownstones in cloud..');
        Homey.app.getLocation((cloud, sphereId) => {
          getDevices(cloud, sphereId).catch((e) => {
            console.log('There was a problem obtaining the available devices:', e);
          });
        });
      } else {
        callback(null, []);
      }

      /**
       * This function will obtain all the data of the stones in the sphere.
       */
      async function getDevices(cloud, sphereId) {
        const devices = await cloud.sphere(sphereId).crownstones();
        callback(null, listDevices(devices));
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
