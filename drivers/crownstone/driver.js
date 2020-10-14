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

    onInit() {
        this.log('Crownstone driver has been inited');
        this.cloud = Homey.app.getCloud();  // Get the cloud instance from app.js
        accessToken = Homey.app.getUserToken(function(token){accessToken = token}); // Get the accessToken from app.js
    }

    onPairListDevices( data, callback ) {
        this.log('Start discovering Crownstones in cloud');
        getCurrentLocation(this.cloud).catch((e) => { console.log('There was a problem looking for Crownstones in the cloud:', e); });

        async function getCurrentLocation(cloud){
            let devices = [];
            cloud.setAccessToken(accessToken);  // Obtain accesstoken
            let userLocation = await cloud.me().currentLocation(); // Get current location of the user
            let spheres = await cloud.spheres(); // Get all the spheres you have access to
            if(spheres.length > 0) {
                if (userLocation.length > 0) {
                    let sphereId = userLocation[0]['inSpheres'][0]['sphereId'];	// Get sphere closest to the user // todo: let the user select different spheres
                    let crownstoneList = await cloud.sphere(sphereId).crownstones();
                    for (let i = 0; i < crownstoneList.length; i++) {
                        let device =  { // Device object to push in the list
                            'name': crownstoneList[i].name,
                            'data': {
                                'id': crownstoneList[i].id,
                            }
                        }
                        devices.push(device);
                    }
                } else {
                    console.log('No userlocation found');
                }
            } else {
                console.log('No spheres found');
            }
            callback(null, devices);
        }
    }
}

module.exports = CrownstoneDriver;