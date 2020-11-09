'use strict';

const Homey = require('homey');
let cloudLib = require('crownstone-cloud')
const sseLib = require('crownstone-sse')
let cloud = new cloudLib.CrownstoneCloud();
let sse = new sseLib.CrownstoneSSE();
let sphereId;

let presenceTrigger = new Homey.FlowCardTrigger('user_enters_room');

/**
 * This code runs when a trigger has been fired. If the room name and id are equal, the flow will run.
 */
presenceTrigger.register().registerRunListener((args, state ) => {
  return Promise.resolve(args.rooms.name === state.name && args.rooms.id === state.id);
})

/**
 * This code runs when a flow is being constructed, and a room should be selected.
 * This code returns a list of rooms in a sphere.
 */
presenceTrigger.getArgument('rooms').registerAutocompleteListener(( query, args ) => {
  return Promise.resolve(getRooms().catch((e) => { console.log('There was a problem obtaining the rooms:', e);}));
})

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
   * This method will call the getCurrentLocation function and returns the sphere ID with a callback.
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
}

/**
 * This function will stop all running eventHandlers, in case a user enters other credentials,
 * make a new connection with the sse-server and starts the eventHandler.
 */
async function loginToEventServer(email, password){
  await sse.stop();
  await sse.login(email , password);
  await sse.start(eventHandler);
}

/**
 * The eventHandler receives events from the sse-server and fires the presenceTrigger when a user enters a room.
 */
let eventHandler = (data) => {
  if(data.type === 'presence' && data.subType === 'enterLocation'){
    let state = {'name': data.location.name, 'id': data.location.id}
    presenceTrigger.trigger(null, state).then(this.log).catch(this.error)
  }
}

/**
 * This function will obtain the sphere where the user is currently located.
 */
async function getCurrentLocation(callback){
  let userReference = await cloud.me();
  let userLocation = await userReference.currentLocation();
  if (userLocation.length > 0) {
    let spheres = await cloud.spheres();
    if (spheres.length > 0) {
      sphereId = await userLocation[0]['inSpheres'][0]['sphereId'];
      callback();
    } else {
      console.log('Unable to find sphere');
    }
  } else {
    console.log('Unable to locate user');
  }
}

/**
 * This function obtains all the rooms of the sphere where the user is currently located in.
 */
async function getRooms(){
  await getCurrentLocation(function(){}).catch((e) => { console.log('There was a problem getting the ID of the sphere where the user is currently in:', e); });
  let rooms = await cloud.sphere(sphereId).locations();
  if(rooms.length > 0){
    return listRooms(rooms);
  } else {
    console.log('Unable to find any rooms');
  }
}

/**
 * This function returns a json list with all the rooms in the sphere.
 * [todo:] add custom icons
 */
function listRooms(rooms){
  let roomList = [];
  for(let i = 0; i < rooms.length; i++){
    let room = {
      'name': rooms[i].name,
      'id': rooms[i].id
    }
    roomList.push(room);
  }
  return roomList;
}

module.exports = CrownstoneApp;