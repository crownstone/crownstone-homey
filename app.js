'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

const cloudAPI = require('./ble/cloud/cloudAPI.js').CLOUD;

class CrownstoneApp extends Homey.App {

  onInit() {
    this.log('Crownstone!');
    this.log(`${Homey.app.manifest.id} is running...`);
    this.log('Load bluenet library')

    this.bluenet = new BluenetLib.Bluenet()

    this.email = Homey.ManagerSettings.get("email");
    this.password = Homey.ManagerSettings.get("password");
//    this.sphere = Homey.ManagerSettings.get("sphere");
    
    this.userData = {
      "email": this.email,
      "password": this.password,
      "sphereId": null
  //    "sphereId": this.sphere
    }
  //  this.log(`Use sphereId: ${this.sphere}`)
       
    this.bluenet.cloud.login(this.userData)
//    this.bluenet.linkCloud(this.userData)
      .then(() => {
        this.log("Connected to the cloud");
      })
      .catch((err) => {
        this.log("Error: could not connect to cloud", err);
      })
  }

  getBluenet() {
    return this.bluenet;
  }

  getUserData() {
    return this.userData;
  }

  getCloudAPI() {
    return cloudAPI;
  }
    
  startBle() {
    let BleManager = Homey.ManagerBLE;
    this.log("Start Scanning")
    return BleManager.discover([], 5*1000)
      .then((homeyAdvertisementArray) => {
        this.log("Scan completed, parsing results...")
        homeyAdvertisementArray.forEach((homeyAdvertisement) => {
          if (this.addressIdMap[homeyAdvertisement.address.toLowerCase()]) {
            if (homeyAdvertisement.connectable && homeyAdvertisement.localName === 'Crown') {
              this.log(homeyAdvertisement, homeyAdvertisement.rssi)
              this.discoveredCrownstones[this.addressIdMap[homeyAdvertisement.address.toLowerCase()]] = homeyAdvertisement;
            }
          }
        })
      })
      .then(() => {
        let discoveredIds = Object.keys(this.discoveredCrownstones);
        if (discoveredIds.length > 0) {
          this.log("Discovered Crownstones with the following Ids:", discoveredIds)
          this.log("Doing the thing with the first Crownstone we discovered: ", discoveredIds[0], " with the address:", this.discoveredCrownstones[discoveredIds[0]].address);
          this.doTheThing(this.discoveredCrownstones[discoveredIds[0]])
        }
        else {
          this.log("No Crownstones found in scan...")
        }
      })
      .catch((err) => {
        this.log("Scanning failed...", err);
        throw err;
      })
  }

  searchForSpecificStone(macAddress) {
    let uuid = macAddress.toLowerCase().replace(/(:)/g,'')
    this.log("Searching for Crownstone", uuid)
    return BleManager.find(uuid, 10000)
      .then((homeyAdvertisement) => {
        if (homeyAdvertisement) {
          this.log("Found it!")
          this.discoveredCrownstones[this.addressIdMap[homeyAdvertisement.address.toLowerCase()]] = homeyAdvertisement;
          return homeyAdvertisement;
        }
        else {
          this.log("I'm sorry... I can't find this Crownstone...");
          return null;
        }
      })
      .catch((err) => {
        this.log("I can't find this Crownstone cuz I got an error :(", err)
      })
  }

  doTheThing(homeyAdvertisement) {
    this.log("Doing the thing! Connecting...")
    this.bluenet.connect(homeyAdvertisement)
      .then(() => {
        this.log("Write switch state 0")
        return this.bluenet.control.setSwitchState(0);
      })
      .then(() => {
        this.log("Waiting...")
        return this.bluenet.wait(1);
      })
      .then(() => {
        this.log("Write switch state 1")
        return this.bluenet.control.setSwitchState(1);
      })
      .then(() => {
        this.log("Waiting...")
        return this.bluenet.wait(1);
      })
      .then(() => {
        this.log("Write switch state 0")
        return this.bluenet.control.setSwitchState(0);
      })
      .then(() => {
        this.log("Waiting...")
        return this.bluenet.wait(1);
      })
      .then(() => {
        this.log("Write switch state 1")
        return this.bluenet.control.setSwitchState(1);
      })
      .then(() => {
        this.log("Waiting...")
        return this.bluenet.wait(1);
      })
      .then(() => {
        this.log("Write switch state 0")
        return this.bluenet.control.setSwitchState(0);
      })
      .then(() => {
        // tell the Crownstone to disconnect
        return this.bluenet.control.disconnect()
      })
      .then(() => {
        this.log("Disconnecting...")
        return this.bluenet.disconnect()
      })
      .then(() => {
        this.log("Done!")
      })
      .catch((err) => { this.log("Error in process...", err); })


  }
}

module.exports = CrownstoneApp;
