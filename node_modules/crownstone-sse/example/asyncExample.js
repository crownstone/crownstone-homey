// This is a tiny example on how you should use the library :)

let CsSse = require("../dist/index")

let lib = new CsSse.CrownstoneSSE();

let eventHandler = (data) => {
  console.log("I got an event!", data);
}

// change these to match your Crownstone account credentials
let myCrownstoneEmailAddress = "<yourEmailAddressHere>";
let myCrownstonePassword     = "<yourPasswordHere>";

// There are other options to log in as well if you're not comfortable placing username/password data in code
// check the docs for more info!

(async function() {
  try {
    console.log("Logging in...")
    await lib.login(myCrownstoneEmailAddress,myCrownstonePassword)
    console.log("Connecting to event server...")
    await lib.start(eventHandler);
    console.log("Let's get started!");
  }
  catch(err) {
    console.log("Something went wrong... :(");
  }
})()
