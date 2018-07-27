'use strict';

const Homey = require('homey');

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
        this.cloudAPI.forSphere(this.userData.userId).getDevices()
            .then((devices) => {
                this.log("Found smartphones");
                let sphereId = null;
                // Just assume one smartphone for now and then it knows where it is
                if (devices.length > 0) {
                    sphereId = devices[0].currentSphereId;
                    this.log("Smartphone in sphere", sphereId);
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
                        if (stone.type === 'PLUG' || stone.type === 'BUILT-IN') {
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
