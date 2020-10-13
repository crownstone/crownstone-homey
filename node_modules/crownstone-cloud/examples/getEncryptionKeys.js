let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can get the all keys your user has access to or just the ones from a specific sphere.

**/

async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  let allKeys = await cloud.keys();

  // you can call keys on a sphere object too. Select the sphere by its ID
  let sphereId = '5f3ea7fdd2eabaa437fdd2e6';
  let keysInSphere = await cloud.sphere(sphereId).keys();

}
run().catch((e) => { console.log("There was a problem running this example:", e); });

