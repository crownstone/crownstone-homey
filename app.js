'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');

class MyApp extends Homey.App {


	onInit() {
		this.log('Crownstone is running...');
		this.log('BluenetLib')

    this.bluenet = new BluenetLib.Bluenet()

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