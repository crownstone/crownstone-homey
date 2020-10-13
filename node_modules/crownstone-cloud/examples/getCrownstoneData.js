let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can get your Crownstone data in a number of different ways. This library is built on a chained filtering approach.
 We will show this in the example.

 More information on logging in is found in the logging in example. This will focus on getting the Crownstone data.

**/
async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  // we can get all crownstones that we have access to:
  let allCsData = await cloud.crownstones();

  // select one crownstone by ID
  let id = '5f3ea7fdd2e65b0004646ecf';
  let dataFromId = await cloud.crownstone(idFilter).data();

  // you can also get all crownstones in a specific sphere (since you might have more than 1 sphere)
  // Select the sphere you want via its ID and call crownstones() on that
  let sphereId = '5f3ea7fdd2eabaa437fdd2e6';
  let csDataInSphere = await cloud.sphere(sphereId).crownstones();

  // you can also get all crownstones in a certain room, select the room with its ID.
  let locationId = '5f3ea7fdd2ef3bb3245ac2e6';
  let csDataInRoom = await cloud.location(locationId).crownstones();
}
run().catch((e) => { console.log("There was a problem running this example:", e); });

