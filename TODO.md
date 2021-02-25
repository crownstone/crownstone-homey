# Todo list

- Add the functionality to dim devices using BLE (making use of the Blelib that is added).
- Add a way for the user to choose a specific sphere first when adding new devices thus removing the need for checking 
  the location of the user for the sphere ID every time (recommended to create a custom view where users can select the sphere 
  https://apps-sdk-v3.developer.athom.com/tutorial-Drivers-Pairing-Custom%20Views.html).
  An existing example of the custom view can be found in `/drivers/crownstone/pair/confirmation.html`, it is defined in the driver.compose.json in `/drivers/crownstone/driver.compose.json`.
- Add the functionality where the icons of the rooms defined in the Crownstone App are shown on the Homey App 
  (https://apps-sdk-v3.developer.athom.com/tutorial-Icons.html).
- Add energy consuming monitoring (https://apps-sdk-v3.developer.athom.com/tutorial-Drivers-Energy.html).
- When the state of a Crownstone changes in the Crownstone App, rather than in the Homey App, 
  update the state of the device in the Homey App (update the capabilityValue when a Crownstone is switched 
  https://apps-sdk-v3.developer.athom.com/Device.html#setCapabilityValue).