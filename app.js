'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

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

    this.bluenet.linkCloud(userData);

    this.startBle()
  }

  startBle() {
    let BleManager = Homey.ManagerBLE;
    console.log("Start Scanning")
    BleManager.discover([], 5*1000, (err, advertisements) => {
      console.log('err)',err)
      console.log('advertisements)')
      advertisements.forEach((adv) => {
	console.log(adv, adv.rssi)
      })
    })
  }
}

module.exports = MyApp;
