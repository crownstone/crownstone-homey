'use strict';

const Homey = require('homey');
let cloudLib = require('crownstone-cloud')
let cloud = new cloudLib.CrownstoneCloud();
let accessToken;

/**
 * This class gets the data from the form shown to the user when the latter install the Crownstone app. There are
 * only two fields, email and password. This is used to retrieve all information from the Crownstone cloud. 
 */
class CrownstoneApp extends Homey.App {

  onInit() {
    this.log(`App ${Homey.app.manifest.name.en} is running...`);
    // Get email and password from settings
    this.email = Homey.ManagerSettings.get('email');
    this.password = Homey.ManagerSettings.get('password');
    loginToCloud(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the cloud:', e); });

    // this function runs when a user changed the credentials..
    Homey.ManagerSettings.on('set', function(){
      this.log('Credentials were changed. Creating new cloud instance..');
      this.email = Homey.ManagerSettings.get('email');
      this.password = Homey.ManagerSettings.get('password');
      loginToCloud(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the cloud:', e); });
    });
  }
  // [todo] simplify code
  getUserToken(callback) {
    retrieveAccessToken(function(){
      callback(accessToken);
    });
  }
  getCloud(){
    return cloud;
  }
}

// Make a connection with the cloud and obtain the userdata
async function loginToCloud(email, password){
  await cloud.login(email, password);
  let userData = await cloud.me();
  accessToken = userData.rest.tokenStore.accessToken;
}

// return accesstoken as soon as it is obtained
function retrieveAccessToken(callback){
  if(typeof accessToken !== 'undefined') {
    callback();
  } else {
    setTimeout(function(){
      retrieveAccessToken(callback);}, 50);
  }
}

module.exports = CrownstoneApp;
