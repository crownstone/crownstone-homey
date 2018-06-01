'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

const cloudAPI = require('./ble/cloud/cloudAPI.js').CLOUD;

const Log = require('homey-log').Log;

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

    
    /*
    this.bluenet.linkCloud(userData)
      .then(() => {
	this.log("Successfully connected to the Crownstone cloud");
	//this.log(this.bluenet.settings);
	this.log("Get stones in sphere");
	cloudAPI.forSphere(this.sphere).getStonesInSphere()
	  .then((data) => {

	  })
	  .catch((err) => { 
	    this.log("Error: No stones", err); 
	  })
      })
      .catch((err) => { this.log("Error! Some error...", err); })
    */

    this.setupHomey();

//    this.startBle()
  }
    
  setupHomey() {
    this.log("Setup Homey");

    Homey.ManagerSpeechOutput.say('Anneh, I love you!')
      .then( this.log("Said something...") )
      .catch( this.error("Can't say anything" ));
    this.log("Speech input");

    Homey.ManagerSpeechInput.on('speechEval', function( speech, callback ) {
      this.log("SpeechEval");
      this.log(speech);
      let match = speech.matches.importantProperty.length > 3;
      callback( null, match );
    });

    Homey.ManagerSpeechInput.on('speechMatch', function( speech, onSpeechEvalData ) {
      this.log("SpeechMatch");
          // onSpeechData is whatever you returned in the onSpeech callback
      //     // process and execute the user phrase here
       speech.say( Homey.__('Thanks, will do!') );
      });
  }

  startBle() {
    let BleManager = Homey.ManagerBLE;
    this.log("Start Scanning")
    BleManager.discover([], 5*1000, (err, advertisements) => {
      //this.log('advertisements)')
      advertisements.forEach((adv) => {
//	this.log(adv, adv.rssi)
      })
    })
  }
}

module.exports = MyApp;
