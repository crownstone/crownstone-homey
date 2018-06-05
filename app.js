'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

const cloudAPI = require('./ble/cloud/cloudAPI.js').CLOUD;

class MyApp extends Homey.App {

  onInit() {
    this.log('Crownstone!');
    this.log(`${Homey.app.manifest.id} is running...`);
    this.log('Load bluenet library')

    this.bluenet = new BluenetLib.Bluenet()

    this.email = Homey.ManagerSettings.get("email");
    this.password = Homey.ManagerSettings.get("password");
    this.sphere = Homey.ManagerSettings.get("sphere");
    
    let userData = {
      "email": this.email,
      "password": this.password,
      "sphereId": this.sphere
    }

    this.availableCrownstones = {};
    this.addressIdMap = {};
    this.discoveredCrownstones = {};

    this.bluenet.linkCloud(userData)
      .then(() => {
        this.log("Successfully connected to the Crownstone cloud");
        //this.log(this.bluenet.settings);
        this.log("Get stones in sphere");
        return cloudAPI.forSphere(this.sphere).getStonesInSphere()
	    })
      .then((stones) => {
        if (stones && Array.isArray(stones)) {
          stones.forEach((stone) => {
            if (stone.type === 'PLUG' || stone.type === 'BUILT-IN') {
              this.availableCrownstones[stone.uid] = stone;
              this.addressIdMap[stone.address.toLowerCase()] = stone.uid;
            }
          })
        }
	    })
      .then(() => {
        this.startBle()
      })
      .catch((err) => {
        this.log("Error: No stones", err);
      })

    this.setupHomey();

  }
    
  setupHomey() {
    this.log("Setup Homey");

    // Homey.ManagerSpeechOutput.say('Anneh, I love you!')
    //   .then( this.log("Said something...") )
    //   .catch( this.error("Can't say anything" ));
    // this.log("Speech input");
    //
    // Homey.ManagerSpeechInput.on('speechEval', function( speech, callback ) {
    //   this.log("SpeechEval");
    //   this.log(speech);
    //   let match = speech.matches.importantProperty.length > 3;
    //   callback( null, match );
    // });
    //
    // Homey.ManagerSpeechInput.on('speechMatch', function( speech, onSpeechEvalData ) {
    //   this.log("SpeechMatch");
    //       // onSpeechData is whatever you returned in thediscoveredCrownstones onSpeech callback
    //   //     // process and execute the user phrase here
    //    speech.say( Homey.__('Thanks, will do!') );
    //   });
  }

  startBle() {
    let BleManager = Homey.ManagerBLE;
    this.log("Start Scanning")
    return BleManager.discover([], 5*1000)
      .then((homeyAdvertisementArray) => {
        this.log("Scan completed, parsing results...")
        homeyAdvertisementArray.forEach((homeyAdvertisement) => {
          if (this.addressIdMap[homeyAdvertisement.address.toLowerCase()]) {
            this.log(homeyAdvertisement, homeyAdvertisement.rssi)
            this.discoveredCrownstones[this.addressIdMap[adv.address.toLowerCase()]] = homeyAdvertisement;
          }
        })
      })
      .then(() => {
        let discoveredIds = Object.keys(this.discoveredCrownstones);
        if (discoveredIds.length > 0) {
          this.log("Discovered Crownstones with the following Ids:", discoveredIds)
          this.log("Doing the thing with the first Crownstone we discovered: ", cids[0], " with the address:", this.discoveredCrownstones[cids[0]].address);
          this.doTheThing(this.discoveredCrownstones[cids[0]])
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
          this.discoveredCrownstones[this.addressIdMap[adv.address.toLowerCase()]] = homeyAdvertisement;
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

module.exports = MyApp;
