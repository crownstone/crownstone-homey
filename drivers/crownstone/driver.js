'use strict';

const Homey = require('homey');

/**
 * The deriver is called to list the devices when a user starts to use the app for the first time. It will query
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
        super.onInit();
        this.log("Init Crownstone driver");
        this.userData = Homey.app.getUserData();
        this.cloudAPI = Homey.app.getCloudAPI();
    }

    onPairListDevices( data, callback ) {

        this.log("Discover Crownstones in cloud");
        
        let devices = [];

        this.log("Get current sphere");

        this.cloudAPI.getUserLocation()
            .then((userLocations) => {
                let sphereId = null;
                if (userLocations && Array.isArray(userLocations) && userLocations.length > 0) {
                    let spheres = userLocations[0].inSpheres;
                    // Just assume one sphere per physical location now
                    if (spheres && Array.isArray(spheres) && spheres.length > 0) {
                        sphereId = spheres[0].sphereId;
                        this.log("Smartphone in sphere", sphereId);
                    } else {
                        this.log("No sphere found");
                    }
                } else {
                    this.log("No array of user locations")
                }
                return sphereId; 
            })
            .then((sphereId) => {
                if (sphereId) {
                    return this.cloudAPI.forSphere(sphereId).getStonesInSphere();
                } else {
                    return Promise.reject( new Error('Cannot find the current sphere...') );
                }
            })
            .then((stones) => {
                if (stones && Array.isArray(stones)) {
                    stones.forEach((stone) => {
                        if (stone.type === 'PLUG' || stone.type === 'BUILTIN') {
                            let device = {};
                            device["name"] = stone.name;
                            device["data"] = stone;
                            devices.push(device);
                        }
                    })
                }
            })
            .then(() => {
                callback( null, devices);
            })
            .catch((err) => {
                this.log("Error: No stones", err);
            })
    }
}

module.exports = CrownstoneDriver;
