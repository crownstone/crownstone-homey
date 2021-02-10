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
        //console.log('loading view..');
        if (Homey.app.getLoginState()) {
          // todo: !! add extra view where users can choose to log out. If they press 'next',
          //  the list_devices view is shown.
          socket.showView('list_devices');
        } else {
          socket.showView('login_credentials');
        }
      }
    });

    /**
     * todo: add documentation.
     */
    socket.on('login', (data, callback) => {
      //console.log('login-view');
      return Homey.app.setSettings(data.username, data.password)
          .then((loginState) => {
            if (loginState) {
              //callback(null, true);
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
      //console.log('list_devices-view');
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
       */
      function listDevices(deviceList) {
        const devices = [];
        for (let i = 0; i < deviceList.length; i++) {
          const device = {
            name: deviceList[i].name,
            data: {
              id: deviceList[i].id,
              address: deviceList[i].address,
              locked: deviceList[i].locked,
              dimmed: deviceList[i].abilities[0].enabled,
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
