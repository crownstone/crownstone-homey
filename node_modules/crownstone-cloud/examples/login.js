let cloudLib = require("../dist/")
let cloud = new cloudLib.CrownstoneCloud();

/**

 You can log in with the login method. Alternatively, you can also just set your accessToken.
 This example shows a few different ways to log in, after which it shows you how to set the accesstoken.

 When you call the login method, your token will automatically be stored in the cloud instance, so all subsequent calls will be
 using that authorization.

**/

const crownstoneEmailAddress = "thisIsYourCrownstoneEmailAddress@test.com";
const crownstonePassword     = "and your password";

// using async functions
async function run() {
  await cloud.login(crownstoneEmailAddress, crownstonePassword)
  let myUserData = await cloud.me().data()
  console.log(myUserData);
}
run().catch((e) => { console.log("There was a problem running this example:", e); });


// using promises
cloud.login(crownstoneEmailAddress, crownstonePassword)
  .then(() => {
    return cloud.me().data()
  })
  .then((myUserData) => {
    console.log(myUserData);
  })
  .catch((e) => { console.log("There was a problem running this example:", e); });


/**

 You can manually set your userData instead of logging in too. This will also store the authentication data into the instance.

**/
const myAccessToken = 'this is my accesstoken or oauth token';
const myUserId      = 'this is my userId'; //optional

cloud.setAccessToken(myAccessToken, myUserId);


