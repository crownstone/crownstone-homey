'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

const cloudAPI = require('./ble/cloud/cloudAPI.js').CLOUD;

class MyApp extends Homey.App {


  onInit() {
    this.log('Crownstone is running...');
    this.log('BluenetLib')

    this.bluenet = new BluenetLib.Bluenet()

    this.email = Homey.ManagerSettings.get("email");
    this.password = Homey.ManagerSettings.get("password");
    this.sphere = Homey.ManagerSettings.get("sphere");
    
    let userData = {
      "email": this.email,
      "password": this.password,
      "sphereId": this.sphere
    }

    this.bluenet.linkCloud(userData)
      .then(() => {
	console.log("Successfully connected to the Crownstone cloud");
	console.log(this.bluenet.settings);
	console.log("Get stones in sphere");
	cloudAPI.forSphere(this.sphere).getStonesInSphere()
	  .then((data) => {

	  })
	  .catch((err) => { 
	    console.log("Error: No stones", err); 
	  })
	console.log(cloud);
	/*
	this.bluenet.cloud.getStonesInSphere();
	console.log("Done!");*/
      })
      .catch((err) => { console.log("Error! Some error...", err); })

    this.startBle()
  }

  startBle() {
    let BleManager = Homey.ManagerBLE;
    console.log("Start Scanning")
    BleManager.discover([], 5*1000, (err, advertisements) => {
      console.log('advertisements)')
      advertisements.forEach((adv) => {
//	console.log(adv, adv.rssi)
      })
    })
  }
}

module.exports = MyApp;
