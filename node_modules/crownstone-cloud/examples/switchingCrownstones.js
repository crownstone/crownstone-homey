let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can switch a Crownstone via the cloud using the Crownstones class. You can get this class in a number of different ways.

 More information on logging in is found in the logging in example. This will focus on getting the Crownstone data.

**/
async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  let ceilingLight = cloud.crownstone('5f3ea7fdd2e65b0004646ecf');

  // now let's set the ceiling light to 50%
  await ceilingLightById.setSwitch(50);

  // currently, we can only switch one crownstone at a time.
}
run().catch((e) => { console.log("There was a problem running this example:", e); });

