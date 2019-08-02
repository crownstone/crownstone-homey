'use strict';

const Homey = require('homey');
const BluenetLib = require('./ble/index');
const cloudAPI = require('./ble/cloud/cloudAPI.js').CLOUD;
const sha1 = require('sha-1');  

/**
 * This class gets the data from the form shown to the user when the latter install the Crownstone app. There are
 * only two fields, email and password. This is used to retrieve all information from the Crownstone cloud. 
 */
class CrownstoneApp extends Homey.App {

  onInit() {
    this.log('Crownstone!');
    this.log(`App ${Homey.app.manifest.id} is running...`);
    this.log('Load bluenet library')

    this.bluenet = new BluenetLib.Bluenet()

    this.bluenet.setApp(this);

    // get email and password from settings
    this.email = Homey.ManagerSettings.get("email");
    this.password = Homey.ManagerSettings.get("password");
   
    // user data with the password from here-on encrypted
    this.userData = {
      "email": this.email,
      "sha1Password": sha1(this.password),
      "userId": "undefined here, in cloudAPI",
      "token": "undefined here, in cloudAPI"
    }

    // obtain token for the Crownstone cloud, it is stored in the cloudAPI object 
    this.bluenet.cloud.login(this.userData)
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
    
}

module.exports = CrownstoneApp;
