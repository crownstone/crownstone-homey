let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 Here you can see how to get your sphere's data.

 More information on logging in is found in the logging in example. This will focus on getting the Sphere data.

**/
async function run() {
  await cloud.login('crownstoneEmail', 'crownstonePassword')

  // we can get all spheres that we have access to:
  let allSpheres = await cloud.spheres();

  // you can also get the data from a specific sphere, select the sphere by its ID;
  let officeSphereId = '5f3ea7fdd2eabaa437fdd2e6';
  let officeSphere = cloud.sphere(officeSphereId);
  let officeSphereData = await officeSphere.data();
}
run().catch((e) => { console.log("There was a problem running this example:", e); });

