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
   * todo: add documentation.
   * @param socket
   */
  onPair(socket) {

    /**
     * todo: add documentation.
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
     * todo: add documentation.
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
     * todo: add documentation.
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
       * This function returns a json list with all the devices and their name, ID and address in the sphere.
       * It will also add the locked state, dim capability and an active value.
       */
      function listDevices(deviceList) {
        const devices = [];
        for (let i = 0; i < deviceList.length; i++) {
          const device = {
            name: deviceList[i].name,
            data: {
              id: deviceList[i].id,
            },
            store: {
              address: deviceList[i].address,
              locked: deviceList[i].locked,
              dimmed: deviceList[i].abilities[0].enabled,
              active: false,
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
