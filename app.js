'use strict';

const Homey = require('homey');

/**
 * This class gets the data from the form shown to the user when the latter install the Crownstone app. There are
 * only two fields, email and password. This is used to retrieve all information from the Crownstone cloud. 
 */
class CrownstoneApp extends Homey.App {

  onInit() {
    this.log('Crownstone!');
    this.log(`App ${Homey.app.manifest.id} is running...`);
    this.log('Load bluenet library')

    // get email and password from settings
    this.email = Homey.ManagerSettings.get("email");
    this.password = Homey.ManagerSettings.get("password");

  }
}

module.exports = CrownstoneApp;
