const Homey = require('homey');
const cloudLib = require('crownstone-cloud');
const sseLib = require('crownstone-sse');

const cloud = new cloudLib.CrownstoneCloud();
const sse = new sseLib.CrownstoneSSE();

let sphereId;
let userLocations = [];

const presenceTrigger = new Homey.FlowCardTrigger('user_enters_room');
const presenceCondition = new Homey.FlowCardCondition('user_presence');

/**
 * This code runs when a trigger has been fired. If the room name and id are equal, the flow will run.
 */
presenceTrigger.register().registerRunListener((args, state) =>
    Promise.resolve(args.rooms.id === state.locationId && args.users.id === state.userId
        || args.users.id === 'default')
);

/**
 * This code runs after a trigger has been fired and a condition-card is configured in the flow.
 * If the room name and id are equal to the name and id from the room the user is currently in, the flow will run.
 * [todo:] Check for users!!
 */
presenceCondition.register().registerRunListener(async (args) => {
  if (args.users.id === 'default') {
    return checkRoomId(args.rooms.id);
  } else {
    let userInList = checkUserId(args.users.id);
    if (userInList > -1) { return Promise.resolve(args.rooms.id === userLocations[userInList].locations[0]); }
    return false;
  }
});

/**
 * This code runs when a flow is being constructed for a trigger-card, and a room should be selected.
 * This code returns a list of rooms in a sphere which is shown to the user.
 */
presenceTrigger.getArgument('rooms').registerAutocompleteListener(() =>
    Promise.resolve(getRooms().catch((e) => { console.log('There was a problem obtaining the rooms:', e);
})));

/**
 * This code runs when a flow is being constructed for a trigger-card, and a user should be selected.
 * This code returns a list of users in a sphere.
 */
presenceTrigger.getArgument('users').registerAutocompleteListener(() =>
    Promise.resolve(getUsers().catch((e) => { console.log('There was a problem obtaining the users:', e);
})));

/**
 * This code runs when a flow is being constructed for a condition-card, and a room should be selected.
 * This code returns a list of rooms in a sphere.
 */
presenceCondition.getArgument('rooms').registerAutocompleteListener(() =>
    Promise.resolve(getRooms().catch((e) => { console.log('There was a problem obtaining the rooms:', e);
})));

/**
 * This code runs when a flow is being constructed for a condition-card, and a user should be selected.
 * This code returns a list of users in a sphere.
 */
presenceCondition.getArgument('users').registerAutocompleteListener(() =>
    Promise.resolve(getUsers().catch((e) => { console.log('There was a problem obtaining the users:', e);
})));

/**
 * This class gets the data from the form shown to the user when the latter install the Crownstone app.
 * There are only two fields, email and password.
 * This is used to retrieve all information from the Crownstone cloud.
 */
class CrownstoneApp extends Homey.App {
  /**
   * This method is called when the App is initialized.
   * The email and password for the Crownstone Cloud from the user will be obtained using the data from the form.
   * Instances of the flowcard triggers and conditions are inited.
   */
  onInit() {
    this.log(`App ${Homey.app.manifest.name.en} is running...`);
    this.email = Homey.ManagerSettings.get('email');
    this.password = Homey.ManagerSettings.get('password');
    setupConnections(this.email, this.password).catch((e) => {
      console.log('There was a problem making the connections:', e); });

    /**
     * This function will fire when a user changed the credentials in the settings-page.
     */
    Homey.ManagerSettings.on('set', function () {
      this.email = Homey.ManagerSettings.get('email');
      this.password = Homey.ManagerSettings.get('password');
      setupConnections(this.email, this.password).catch((e) => {
        console.log('There was a problem making the connections:', e); });
    });
  }

  /**
   * This method will call the getSphereId function and returns the sphere ID with a callback.
   */
  getLocation(callback) {
    getSphereId(() => {
      callback(cloud, sphereId);
    }).catch((e) => { console.log('There was a problem getting the sphere Id:', e); });
  }

  /**
   * This method will return the instance of the cloud.
   */
  getCloud() {
    return cloud;
  }
}

/**
 * This function will make a connection with the cloud, call the function to get all the users and
 * their locations in the sphere, and call the function to make a connection to the event server.
 */
async function setupConnections(email, password) {
  await cloud.login(email, password).catch((e) => {
    console.log('There was a problem making a connection with the cloud:', e); });
  await getPresentPeople();
  await loginToEventServer(email, password).catch((e) => {
    console.log('There was a problem making a connection with the event server:', e); });
}

/**
 * This function will stop all running eventHandlers, in case a user enters other credentials,
 * make a new connection with the sse-server and starts the eventHandler.
 */
async function loginToEventServer(email, password) {
  await sse.stop();
  await sse.login(email, password);
  await sse.start(eventHandler);
}

/**
 * The eventHandler receives events from the sse-server and fires the runTrigger-function
 * when a user enters or leaves a room.
 */
let eventHandler = (data) => {
  if (data.type === 'presence' && data.subType === 'enterLocation') {
    runTrigger(data, true).catch((e) => {
      console.log('There was a problem firing the trigger:', e); });
  }
  if (data.type === 'presence' && data.subType === 'exitLocation') {
    runTrigger(data, false).catch((e) => {
      console.log('There was a problem firing the trigger:', e); });
  }
};

/**
 * This function will update the userLocations-list and will fire the trigger after it is complete.
 */
async function runTrigger(data, entersRoom) {
  const state = { userId: data.user.id, locationId: data.location.id };
  await updateUserLocation(entersRoom, data.user.id, data.location.id);
  if (entersRoom) { presenceTrigger.trigger(null, state).then(this.log).catch(this.error); }
}

/**
 * This function will update the userLocations-list by using events.
 * To fix missed events: If an ID is missing or is the same as the newer ID,
 * the getPresentPeople-function will be called to refresh the list.
 */
async function updateUserLocation(entersRoom, userId, location) {
  let userInList = checkUserId(userId);
  if (entersRoom) {
    if (userInList < 0) {
      const userLocation = {
        userId: userId,
        locations: [ location ],
      };
      userLocations.push(userLocation);
    } else {
      if (userLocations[userInList].locations[0] === location) {
        getPresentPeople(() => {}).catch((e) => {
          console.log('There was a problem getting the locations of the users:', e); });
      } else {
        userLocations[userInList].locations[0] = location;
      }
    }
  } else if (!entersRoom) {
    if (userInList > -1) {
      if (userLocations[userInList].locations[0] !== location) {
        return;
      }
    }
    getPresentPeople(() => {}).catch((e) => {
      console.log('There was a problem getting the locations of the users:', e); });
  }
}

/**
 * This function will check if the userId is already defined in the list of userLocations and returns the index.
 */
function checkUserId(userId) {
  for (let i = 0; i < userLocations.length; i++) {
    if (userLocations[i].userId === userId) { return i; }
  }
  return -1;
}

/**
 * This function will check if the roomId exists in the list of userLocations and returns a boolean.
 */
function checkRoomId(roomId) {
  for (let i = 0; i < userLocations.length; i++) {
    if (userLocations[i].locations[0] === roomId) { return true; }
  }
  return false;
}

/**
 * This function will obtain all the users and their locations in the sphere.
 */
async function getPresentPeople() {
  await getSphereId(() => {}).catch((e) => { console.log('There was a problem getting the sphere Id:', e); });
  if (typeof sphereId !== 'undefined') {
    userLocations = await cloud.sphere(sphereId).presentPeople();
  }
}

/**
 * This function will obtain the sphere and, if available, the room where the user is currently located.
 */
async function getSphereId(callback) {
  const userReference = await cloud.me();
  const userLocation = await userReference.currentLocation();
  if (userLocation.length > 0) {
    const spheres = await cloud.spheres();
    if (spheres.length > 0) {
      sphereId = userLocation[0].inSpheres[0].sphereId;
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
async function getRooms() {
  await getSphereId(() => {}).catch((e) => {
    console.log('There was a problem getting the sphere Id:', e); });
  const rooms = await cloud.sphere(sphereId).locations();
  if (rooms.length > 0) {
    return listRooms(rooms);
  }
  console.log('Unable to find any rooms');
  return [];
}

/**
 * This function returns a json list with all the rooms in the sphere.
 * [todo:] add custom icons
 */
function listRooms(rooms) {
  const roomList = [];
  for (let i = 0; i < rooms.length; i++) {
    const room = {
      name: rooms[i].name,
      id: rooms[i].id,
    };
    roomList.push(room);
  }
  return roomList;
}

/**
 * This function will ask for the sphere Id and return a list of all the users in the sphere.
 */
async function getUsers(){
  await getSphereId(() => {}).catch((e) => {
    console.log('There was a problem getting the sphere Id:', e); });
  const users = await cloud.sphere(sphereId).users();
  return listUsers(users);
}

/**
 * This function returns a list of all the users in the sphere.
 * A default user 'somebody' is added to use in a card which will be accepted with every user check.
 */
function listUsers(users) {
  const userList = [];
  const defaultUser = {
    name: 'Somebody',
    id: 'default',
  };
  userList.push(defaultUser);
  addUserToList(userList, users.admins);
  addUserToList(userList, users.members);
  addUserToList(userList, users.guests);
  if (userList.length > 1) {
    return userList;
  }
  console.log('Unable to find any users');
  return [];
}

/**
 * This function pushes json objects of the users to a user list.
 */
function addUserToList(userList, users) {
  for (let i = 0; i < users.length; i++) {
    const user = {
      name: users[i].firstName + ' ' + users[i].lastName,
      id: users[i].id,
    };
    userList.push(user);
  }
}

module.exports = CrownstoneApp;
