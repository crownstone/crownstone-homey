'use strict';

const Homey = require('homey');
let cloudLib = require('crownstone-cloud')
const sseLib = require('crownstone-sse')
let cloud = new cloudLib.CrownstoneCloud();
let sse = new sseLib.CrownstoneSSE();
let sphereId;

/**
 * This class gets the data from the form shown to the user when the latter install the Crownstone app. There are
 * only two fields, email and password. This is used to retrieve all information from the Crownstone cloud. 
 */
class CrownstoneApp extends Homey.App {

  /**
   * This method is called when the App is initialized.
   * The email and password for the Crownstone Cloud from the user will be obtained using the data from the form.
   * Instances of the flowcard triggers and conditions are inited.
   */
  onInit(){
    this.log(`App ${Homey.app.manifest.name.en} is running...`);
    this.email = Homey.ManagerSettings.get('email');
    this.password = Homey.ManagerSettings.get('password');
    loginToCloud(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the cloud:', e); });
    loginToEventServer(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the event server:', e); });

    let presenceTrigger = new Homey.FlowCardTrigger('room_presence');
    presenceTrigger.register().registerRunListener(( args, state ) => {
    }).getArgument('room_autocomplete').registerAutocompleteListener(( query, args ) => {
      return Promise.resolve(getRooms().catch((e) => { console.log('There was a problem obtaining the rooms:', e);}));
    })

    /**
     * This function will fire when a user changed the credentials in the settings-page.
     */
    Homey.ManagerSettings.on('set', function (){
      this.email = Homey.ManagerSettings.get('email');
      this.password = Homey.ManagerSettings.get('password');
      loginToCloud(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the cloud:', e); });
      loginToEventServer(this.email, this.password).catch((e) => { console.log('There was a problem making a connection with the event server:', e); });
    });
  }

  /**
   * [todo] documentation
   */
  getLocation(callback){
    getCurrentLocation(function(){
      callback(cloud, sphereId);
    }).catch((e) => { console.log('There was a problem getting the ID of the sphere where the user is currently in:', e); });
  }

  /**
   * This method will return the instance of the cloud.
   */
  getCloud(){
    return cloud;
  }
}

/**
 * This function will make a connection with the cloud and obtain the userdata.
 */
async function loginToCloud(email, password){
  await cloud.login(email, password);
  await getCurrentLocation(function(){}).catch((e) => { console.log('There was a problem getting the ID of the sphere where the user is currently in:', e); });
}

/**
 * [todo] documentation
 */
async function loginToEventServer(email, password){
  await sse.stop();
  console.log('previous eventhandler stopped');
  await sse.login(email , password);
  console.log('logged in with sse');
  await sse.start(eventHandler);
  console.log('eventhandler started!');
}

/**
 * [todo] documentation
 */
let eventHandler = (data) => {
  if(data.type === 'presence' && data.subType === 'enterLocation'){
    let location = data.location.name;
    console.log('user entered location: ' + location)
  }
}

/**
 * [todo] documentation
 */
async function getCurrentLocation(callback){
  let userReference = await cloud.me();
  let userLocation = await userReference.currentLocation();
  if (userLocation.length > 0) {
    let spheres = await cloud.spheres();
    if (spheres.length > 0) {
      sphereId = await userLocation[0]['inSpheres'][0]['sphereId'];
      console.log('Userlocation found: ' + sphereId);
      callback();
    } else {
      console.log('Unable to find sphere');
    }
  } else {
    console.log('Unable to locate user');
  }
}

/**
 * [todo] documentation
 */
async function getRooms(){
  let rooms = await cloud.sphere(sphereId).locations();
  if(rooms.length > 0){
    return listRooms(rooms);
  } else {
    console.log('Unable to find any rooms');
  }
}

/**
 * [todo] documentation
 * [todo:] add custom icons
 */
function listRooms(rooms){
  let roomList = [];
  for(let i = 0; i < rooms.length; i++){
    let room = {
      'name': rooms[i].name,
      'id': rooms[i].id
    }
    console.log(room.name);
    roomList.push(room);
  }
  return roomList;
}

module.exports = CrownstoneApp;