let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can get your user data, just user id and current location from the user object.

 This location should only be used as an initial location estimate.
 For updates to the location, do not poll the location, but use the SSE events via the SSE library (crownstone-sse).

**/

async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  let userReference = cloud.me();

  let userId       = await userReference.id();
  let userData     = await userReference.data();
  let userLocation = await userReference.currentLocation();

}
run().catch((e) => { console.log("There was a problem running this example:", e); });

