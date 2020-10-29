'use strict';

const Homey = require('homey');
let accessToken;

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
     * It will obtain the cloud instance and the access token.
     * */
    onInit() {
        this.log('Crownstone driver has been inited');
        this.cloud = Homey.app.getCloud();
        accessToken = Homey.app.getUserToken(function(token){accessToken = token});
    }

    /**
     * This method is called when a user is adding a device
     * and the 'list_devices' view is called.
     */
    onPairListDevices( data, callback ){
        this.log('Start discovering Crownstones in cloud');
        getCurrentLocation(this.cloud).catch((e) => { console.log('There was a problem looking for Crownstones in the cloud:', e); });

        /**
         * This function obtains and checks information from the Crownstone Cloud to see if the information isn't undefined.
         * [todo]: let the user select a specific sphere
         */
        async function getCurrentLocation(cloud) {
            cloud.setAccessToken(accessToken);
            let deviceList;
            let userReference = await cloud.me();
            let userLocation = await userReference.currentLocation();
            if (userLocation.length > 0) {
                let spheres = await cloud.spheres();
                if (spheres.length > 0) {
                    let sphereId = await userLocation[0]['inSpheres'][0]['sphereId'];
                    let devices = await cloud.sphere(sphereId).crownstones();
                    callback(null, listDevices(devices));
                } else {
                    console.log('Unable to find sphere');
                }
            } else {
                console.log('Unable to locate user');
            }
        }

        /**
         * This function returns a json list with all the devices in the sphere.
         */
        function listDevices(deviceList){
            let devices = [];
            for (let i = 0; i < deviceList.length; i++) {
                let device =  {
                    'name': deviceList[i].name,
                    'data': {
                        'id': deviceList[i].id,
                    }
                }
                devices.push(device);
            }
            return devices;
        }

    }
}

module.exports = CrownstoneDriver;