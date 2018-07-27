'use strict';

const Homey = require('homey');

class CrownstoneDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('Init Crownstone device');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());
        //this.log('data:', this.getData());
        
        this.bluenet = Homey.app.getBluenet();

        // register a capability listener
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))

        this.addressIdMap = {};
        this.discoveredCrownstones = {};
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('Crownstone added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('Crownstone deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        this.log('Set on/off:', value);
        this.state = 0;
        if (value == true) {
            this.state = 1;
        }

        if (!this.getData()) {
            return Promise.reject( new Error('Could not find this device') );
        }
        let result = true;
        this.address = this.getData().address;
        return this.searchForSpecificStone(this.address)
            .then((homeyAdvertisement) => {
                if (homeyAdvertisement) {
                    this.log('Switch crownstone');
                    return this.switchCrownstone(homeyAdvertisement, this.state);
                } else {
                    return Promise.reject( new Error('Cannot find this stone!') );
                }
            })
            .then((result) => {
                this.log('Report switch', result);
                //callback(null, result);
                return result;
            })
            .catch((err) => {
                this.log("Catch and reject", err);
                throw err;
            })

        //return Promise.reject( new Error('Switching the device failed!') );
    }

    searchForSpecificStone(macAddress) {
        let uuid = macAddress.toLowerCase().replace(/(:)/g,'')
        this.log("Search for", uuid)
        let BleManager = Homey.ManagerBLE;
        // search for 5 seconds
        return BleManager.discover([], 10000)
            .then((advArray) => {
                this.log("Scan completed, parsing results...", advArray)
                let tempAdv = null;
                advArray.forEach((adv) => {
                    if (adv.connectable) {
                        //this.log(adv, adv.rssi)
                        this.log("Found:", adv.address);
                        this.discoveredCrownstones[this.addressIdMap[adv.address.toLowerCase()]] = adv;
                        if (adv.uuid == uuid) {
                            this.log("Found Crownstone!");
                            tempAdv = adv;
                        }
                    } else {
                        if (adv.uuid == uuid) {
                            this.log("Found unconnectable Crownstone, continue discovery...");
                        }
                    }
                })
                return tempAdv;
//                return Promise.reject( new Error('Cannot find this stone!') );
            })
    }

    searchForSpecificStoneWithFindDoesNotWork(macAddress) {
        let uuid = macAddress.toLowerCase().replace(/(:)/g,'')
        this.log("Search for", uuid)
        let BleManager = Homey.ManagerBLE;
        return BleManager.find(uuid, 10000)
            .then((homeyAdvertisement) => {
                if (homeyAdvertisement) {
                    this.log("Found Crownstone!")
                    return homeyAdvertisement;
                }
                else {
                    this.log("I'm sorry... I can't find this Crownstone...");
                    return null;
                }
            })
            .catch((err) => {
                this.log("I can't find this Crownstone cuz I got an error :(", err)
                throw err;
            })
    }
  
    switchCrownstone(homeyAdvertisement, state) {
        this.log("Connect to Crownstone");
        return this.bluenet.connect(homeyAdvertisement)
            .then(() => {
                this.log("Write switch state: ", state);
                return this.bluenet.control.setSwitchState(state);
            })
            .then(() => {
                this.log("Tell Crownstone to disconnect")
                return this.bluenet.control.disconnect();
            })
            .then(() => {
                this.log("Disconnect ourselves")
                return this.bluenet.disconnect();
            })
            .then(() => {
                this.log("Done!")
                return true;
            })
            .catch((err) => { 
                this.log("Error in process...", err);
                throw err;
            })
    }
}

module.exports = CrownstoneDevice;
