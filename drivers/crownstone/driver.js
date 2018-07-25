'use strict';

const Homey = require('homey');

class CrownstoneDriver extends Homey.Driver {

    onInit() {
        super.onInit();
        this.log("Init Crownstone driver");
//        this.bluenet = Homey.app.getBluenet();
        this.userData = Homey.app.getUserData();
        this.cloudAPI = Homey.app.getCloudAPI();
    }

    onPairListDevices( data, callback ){

        this.log("Discover Crownstones in cloud");
        
        let devices = [];

        // Todo: test if properly linked before (should be done in app.js)
        //this.bluenet.linkCloud(this.userData)
        //    .then(() => {
        //        this.log("Connected to the cloud");
        //        this.log("Get current sphere (not yet implemented)");
        //        this.log("Get stones in current sphere");
        //        return 
        this.log("Get stones in current sphere");
        this.cloudAPI.forSphere(this.userData.sphereId).getStonesInSphere()
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
