# crownstone-homey

Integration with Homey

First, find the `HOMEY_IP` address. Use e.g. `sudo arp-scan -l` and search for a device with manufacturer name
`Azurewave Technologies, Inc.`.

Navigate to <http://$HOMEY_IP/manager/settings/#homey:manager:apps> to operate the graphical user interface that
is run from your Homey device.

At the Athom [documentation](https://developer.athom.com/docs/apps/tutorial-Getting%20Started.html) you have a
getting started manual. It tells you to install the `athom` utility through npm. It is similar in operation to for
example the `heroku` utility. After setting up keys etc. as indicated over there, go to the root directory of 
this repository:

    athom app run

In the GUI a Crownstone application appears.

![Crownstone in the Homey GUI](doc/homey-gui-crownstone-app.png)

If you click at the `Crownstone` text at the bottom left, you see a new dialog appear:

![Configuration of Crownstone in the Homey GUI](doc/homey-gui-crownstone-app-config.png)

The `sphere id` can be found through using the [Crownstone cloud API](https://cloud.crownstone.rocks). Get first
your access token by logging in, find your `user id` by the `/users/me` endpoint and then do the proper REST call to
get all your spheres:

    access_token=XXXXXXXXXXXXXXX
	user_id=XXXXXXXXXXXX
    curl -s -X GET "https://cloud.crownstone.rocks/api/users/$user_id/spheres?access_token=$access_token"

Check <https://github.com/mrquincle/crownstone-bash> for utility functions that do this automatically. You can do
also perform this all in the web interface. This is also described in the Homey GUI.

After running you will see something like:

```
┌────────────────────────────────────────────┐
│ Hey developer, we're hiring! View our open │
│ positions at https://go.athom.com/jobs     │
└────────────────────────────────────────────┘
✓ Validating app...
✓ Homey App validated successfully against level `debug`
✓ Packing Homey App...
✓ Installing Homey App on `Crowny` (http://10.27.8.182:80)...
✓ Homey App `rocks.crownstone` successfully installed
✓ Running `rocks.crownstone`, press CTRL+C to quit
─────────────── Logging stdout & stderr ───────────────
2018-07-24 14:50:40 [log] [MyApp] Crownstone!
2018-07-24 14:50:40 [log] [MyApp] rocks.crownstone is running...
2018-07-24 14:50:40 [log] [MyApp] Load bluenet library
2018-07-24 14:50:40 [log] [MyApp] Setup Homey
2018-07-24 14:50:40 [log] [ManagerDrivers] [crownstone] Init Crownstone driver
2018-07-24 14:50:41 [log] [MyApp] Successfully connected to the Crownstone cloud
2018-07-24 14:50:41 [log] [MyApp] Get stones in sphere
2018-07-24 14:50:42 [log] [MyApp] Start Scanning
2018-07-24 14:50:48 [log] [MyApp] Scan completed, parsing results...
2018-07-24 14:50:48 [log] [MyApp] No Crownstones found in scan...
```

We are hiring as well. :-)

# Current implementation

The current implementation scans for Crownstones (makes sure that they are visible from the Homey!), picks the first
one and sends it a series of commands.

```
✓ Running `rocks.crownstone`, press CTRL+C to quit
─────────────── Logging stdout & stderr ───────────────
2018-07-24 15:42:46 [log] [MyApp] Crownstone!
2018-07-24 15:42:46 [log] [MyApp] rocks.crownstone is running...
2018-07-24 15:42:46 [log] [MyApp] Load bluenet library
2018-07-24 15:42:46 [log] [MyApp] Use sphereId: XXXXXXXXXXXXXXXXXXXXXX
2018-07-24 15:42:46 [log] [MyApp] Setup Homey
2018-07-24 15:42:46 [log] [ManagerDrivers] [crownstone] Init Crownstone driver
2018-07-24 15:42:47 [log] [MyApp] Successfully connected to the Crownstone cloud
2018-07-24 15:42:47 [log] [MyApp] Get stones in sphere
2018-07-24 15:42:48 [log] [MyApp] Start Scanning
2018-07-24 15:42:53 [log] [MyApp] Scan completed, parsing results...
2018-07-24 15:42:53 [log] [MyApp] BleAdvertisement {
  domain: null,
  _events: {},
  _eventsCount: 0,
  _maxListeners: undefined,
  id: 'e4b22c85a934',
  uuid: 'e4b22c85a934',
  address: 'e4:b2:2c:85:a9:34',
  addressType: 'random',
  connectable: true,
  localName: 'Crown',
  manufacturerData: <Buffer 4c 00 02 15 e2 e1 0a 19 68 80 45 01 ab 90 cc 6f 8f a8 f5 a8 35 59 37 48 c4>,
  serviceData: [],
  serviceUuids: [],
  rssi: -78,
  connect: [Function: bound connect],
  printInfo: [Function: bound printInfo] } -78
2018-07-24 15:42:53 [log] [MyApp] BleAdvertisement {
  domain: null,
  _events: {},
  _eventsCount: 0,
  _maxListeners: undefined,
  id: 'f34fc7ab2737',
  uuid: 'f34fc7ab2737',
  address: 'f3:4f:c7:ab:27:37',
  addressType: 'random',
  connectable: true,
  localName: 'Crown',
  manufacturerData: <Buffer 4c 00 02 15 e2 e1 0a 19 68 80 45 01 ab 90 cc 6f 8f a8 f5 a8 8f 7c 8d 65 c4>,
  serviceData: [],
  serviceUuids: [],
  rssi: -82,
  connect: [Function: bound connect],
  printInfo: [Function: bound printInfo] } -82
2018-07-24 15:42:53 [log] [MyApp] BleAdvertisement {
  domain: null,
  _events: {},
  _eventsCount: 0,
  _maxListeners: undefined,
  id: 'da5237cb065b',
  uuid: 'da5237cb065b',
  address: 'da:52:37:cb:06:5b',
  addressType: 'random',
  connectable: true,
  localName: 'Crown',
  manufacturerData: <Buffer 4c 00 02 15 e2 e1 0a 19 68 80 45 01 ab 90 cc 6f 8f a8 f5 a8 dc 86 cc ab c4>,
  serviceData: [],
  serviceUuids: [],
  rssi: -75,
  connect: [Function: bound connect],
  printInfo: [Function: bound printInfo] } -75
2018-07-24 15:42:53 [log] [MyApp] BleAdvertisement {
  domain: null,
  _events: {},
  _eventsCount: 0,
  _maxListeners: undefined,
  id: 'e95fdbb9aff1',
  uuid: 'e95fdbb9aff1',
  address: 'e9:5f:db:b9:af:f1',
  addressType: 'random',
  connectable: true,
  localName: 'bart',
  manufacturerData: <Buffer 4c 00 02 15 e2 e1 0a 19 68 80 45 01 ab 90 cc 6f 8f a8 f5 a8 77 57 4f 68 c4>,
  serviceData: [],
  serviceUuids: [],
  rssi: -89,
  connect: [Function: bound connect],
  printInfo: [Function: bound printInfo] } -89
2018-07-24 15:42:53 [log] [MyApp] Discovered Crownstones with the following Ids: [ '4', '10', '11', '13' ]
2018-07-24 15:42:53 [log] [MyApp] Doing the thing with the first Crownstone we discovered:  4  with the address: e9:5f:db:b9:af:f1
2018-07-24 15:42:53 [log] [MyApp] Doing the thing! Connecting...
Connected successfully!
Getting Services...
Getting Characteristics...
Connection process complete.
Getting Session Nonce...
Got Nonce!
Decrypted Nonce <Buffer a3 0d f5 60 ee>
Set Nonce
Session Nonce Processed.
2018-07-24 15:42:58 [log] [MyApp] Write switch state 0
2018-07-24 15:42:58 [log] [MyApp] Waiting...
2018-07-24 15:42:59 [log] [MyApp] Write switch state 1
2018-07-24 15:42:59 [log] [MyApp] Waiting...
2018-07-24 15:43:00 [log] [MyApp] Write switch state 0
2018-07-24 15:43:00 [log] [MyApp] Waiting...
2018-07-24 15:43:02 [log] [MyApp] Write switch state 1
2018-07-24 15:43:02 [log] [MyApp] Waiting...
2018-07-24 15:43:03 [log] [MyApp] Write switch state 0
2018-07-24 15:43:03 [log] [MyApp] Disconnecting...
2018-07-24 15:43:14 [log] [MyApp] Done!
```
