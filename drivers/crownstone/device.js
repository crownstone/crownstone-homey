'use strict';

const Homey = require('homey');

/**
 * Current we have implemented this through the BLE chip on board of the Homey. This has the advantage that we can
 * directly send a command to the Crownstone itself. Henceforth, it should be faster than a round-trip through the
 * cloud. However, in this way it is only possible to set up a connection to a Crownstone that is in the 
 * neighbourhood of the Homey. The Crownstone app knows how to send messages into the mesh. The Homey does not. It
 * only is able to send a request to a device that is broadcasting BLE advertisements in its neighbourhood.
 *
 * It might make sense to have a toggle that defines this behavior. It can define if we should go through the 
 * Crownstone app (but then the particular phone has to be present) or directly with the Crownstones in its vicinity.
 */
class CrownstoneDevice extends Homey.Device {

    // This method is called when the Device is initialized. It does not necessarily do any scanning itself. 
    onInit() {
        this.log('Init Crownstone device');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());
        
        this.bluenet = Homey.app.getBluenet();
        this.userData = Homey.app.getUserData();
        this.cloudAPI = Homey.app.getCloudAPI();

        // register a capability listener
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('Crownstone added');
        // todo register a capability listener for dimming if the Crownstone can be dimmed (use this.getData())
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('Crownstone deleted');
    }

    getSphereId() {
        //return this.userData.sphereId;
        return this.cloudAPI.getUserLocation()
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
            .catch((err) => {
                this.log("Error getting user location from cloud:", err);
            })
    }

    keysExist() {
        return (this.bluenet.settings.memberKey !== null &&
            this.bluenet.settings.memberKey !== null &&
            this.bluenet.settings.adminKey !== null);

    }

    sphereExists() {
        return (this.userData.sphereId && this.userData.sphereId !== null);
    }

    /**
     * This function is called on every on/off event. It obtains sphere and if necessary the keys.
     *
     * Implementation: we promisify the synchronous if statement 
     */
    getSphere() {

        return new Promise((resolve, reject) => {
                if (this.sphereExists()) {
                    return this.userData.sphereId;
                }
                return this.getSphereId();
            })
            .then((sphereId) => {
                if (this.keysExist()) {
                    this.log("Keys already there");
                    return null;
                }
                return this.bluenet.cloud.getKeys(this.userData.sphereId);
            })
            .then((keys) => {
                if (keys !== null) {
                    this.log("Load keys from cloud");
                    this.bluenet.settings.loadKeys(true, keys.admin, keys.member, keys.guest, "CloudData")
                }
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                this.log("Error loading sphere", err);
                reject(err);
            })
    }

    /**
     * Called when the device has requested a state change (turned on or off).
     */
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
        
        this.address = this.getData().address;
        return this.getSphere() 
            .then(() => {
                this.log("Connect to address", this.address);
                return this.searchForSpecificStone(this.address)
            })
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
    }

    /**
     * We search for a particular MAC address (which is called a UUID here). The Homey BLE manager is (indirectly)
     * asked to scan for advertisements from this address. When it is found, the data in the advertisement is used to 
     * connect to it.
     */
    searchForSpecificStone(macAddress) {
        let uuid = macAddress.toLowerCase().replace(/(:)/g,'')
        this.log("Search for", uuid)
        let BleManager = Homey.ManagerBLE;
        return BleManager.find(uuid, 10000)
            .then((homeyAdvertisement) => {
                if (homeyAdvertisement) {
                    this.log("Found Crownstone (through unique advertisement)");
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
 
    /**
     * After an advertisement from the given device has been obtained, we can subsequently switch that particular
     * Crownstone. We do this by setting up a connection to the same MAC address, then we send a command over BLE
     * and we disconnect (at both sides).
     */
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
