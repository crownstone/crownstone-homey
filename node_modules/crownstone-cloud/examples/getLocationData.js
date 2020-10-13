let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can get your Crownstone data in a number of different ways. This library is built on a chained filtering approach.
 We will show this in the example.

 More information on logging in is found in the logging in example. This will focus on getting the Crownstone data.

 **/
async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  // we can get all locations that we have access to:
  let alllocationData = await cloud.locations();

  // you can also get the data of a specific location. get the location by its ID
  let locationId = '5f3ea7fdd2ef3bb3245ac2e6';
  let specificLocationData = await cloud.location(locationId).data();
}
run().catch((e) => { console.log("There was a problem running this example:", e); });

