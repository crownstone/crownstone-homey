# crownstone-lib-nodejs-cloud
Cloud module for the nodejs lib.

# WORK IN PROGRESS
Do not use in current state. The bluenet-nodejs-lib is in the process of being separated into individual modules:
- crownstone-lib-nodejs-core
- crownstone-lib-nodejs-uart
- crownstone-lib-nodejs-ble
- crownstone-lib-nodejs-cloud
- crownstone-lib-nodejs-sse

Will be usable on release 1.0.

This library is made up from 2 parts, one for the Crownstone Cloud and one for the Webhook API. 
You probably don't need the webhook api, but the documentation can be found here [TODO: Write documentation.]
The rest of this document is only regarding the Crownstone Cloud API.

# Installation

If you want to use this library as part of your own codebase, install it using yarn or npm

```
yarn add crownstone-cloud
```
```
npm install crownstone-cloud
```

# Cloning the repository

If you just want to run the library, without getting it from npm, you will have to build manually install the dependencies and build the typescript files to run the examples.
You can do this by running:

```
npm install && npm run build
```

# Getting started


You can use this library as promises or async/await. We will only show async/await here, but all *async* functions are promises. 
This means, everything that can be awaited, can be thenned. More information available on Google.

### Create instance

Let's make an instance of the Crownstone cloud! We will use this instance in the rest of the documentation.
This instance will cache your user tokens.

```
import {CrownstoneCloud} from 'crownstone-cloud';

const cloud = new CrownstoneCloud();
```
If you're using pure node, you can also use require:
```
const csLib = require("crownstone-cloud")
const cloud = new csLib.CrownstoneCloud();
```



### Logging in / authenticating

Before using the cloud library, you should first tell it who you are. You can do this in two ways. You can either log in, using the login method:
```
await cloud.login(crownstoneEmailAddress, crownstonePassword)
```

# API

### CrownstoneCloud

#### *async* login(email: string, password: string) : Promise\<UserLoginData>
>> email: the email address of your Crownstone account.
>>
>> password: the corresponding password.
>>
>> returns UserLoginData: { accessToken: string, ttl: number, userId: string }
>
> You use this method to login to the Crownstone Cloud. Your userId and accesstoken will be cached in the CrownstoneCloud class instance.


#### *async* loginHashed(email: string, hashedPassword: string) : Promise\<UserLoginData> 
>> email: the email address of your Crownstone account.
>>
>> hashedPassword: sha1 hash of the corresponding password.
>>
>> returns UserLoginData: { accessToken: string, ttl: number, userId: string }
>
> You use this method to login to the Crownstone Cloud. Your userId and accesstoken will be cached in the CrownstoneCloud class instance.


#### hashPassword(plaintextPassword: string) : string
>> plaintextPassword: a password.
>>
>> returns hashedPassword: sha1 hash of the corresponding password.
>
> This will hash the password for you so you can use the loginHashed method with it.

#### *async* hubLogin(hubId: string, hubToken: string) : Promise\<HubLoginData> 
>> hubId: cloudId of the hub
>>
>> hubToken: secret token of the hub
>>
>> returns HubLoginData: { accessToken: string, ttl: number }
>
> You use this method to login to the Crownstone Cloud if you're a hub. Your accesstoken will be cached in the CrownstoneCloud class instance.

#### setAccessToken(accessToken: string, userId?: string)
>> accessToken: access token from the Crownstone cloud, or an oauth token from a Crownstone user.
>>
>> userId: optionally provide the userId if you know it beforehand.
>>
>
> This will authenticate you for the subsequent calls to the cloud. Does not do any request to the cloud itself.

#### *async* spheres() : Promise\<cloud_Sphere[]> 
>> returns cloud_Sphere[]: JSON containing the data for all spheres that match the filter. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of your different spheres. Use this to get the sphereId you need for the next method.

#### *async* locations() : Promise\<cloud_Location[]>  
>> returns cloud_Location[]: JSON containing the data for all locations available to you. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of your different locations. Use this to get the location id you need to get a specific location.

#### *async* crownstones() : Promise\<cloud_Stone[]>  
>> returns cloud_Stone[]: JSON containing the data for all crownstones available to you. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of your different spheres. Use this to get the stone id you need to control a specific Crownstone.

#### *async* keys() : Promise\<cloud_Keys[]> 
>> returns cloud_Keys[]: JSON containing keys for all spheres. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts#L113) 
>
> These keys can be used for any bluetooth related operations

#### sphere(id: string) : Sphere 
>> id: A valid cloud Id of a Sphere. 
>>
>> returns Sphere: This object is the starting point to get specific data from your sphere. 
>
> You use this method if you want to get data related to the sphere. This does not request anything from the cloud by itself.


#### location(id: string) : Location 
>> id: A valid cloud Id of a Location.
>>
>> returns Location: This object is the starting point to get specific data from your location. 
>
> You use this method if you want to get data related to the location. This does not request anything from the cloud by itself.


#### crownstone(id: string) : Crownstone 
>> id: A valid cloud Id of a Crownstone.
>>
>> returns Crownstone: This object allows you to get data related to Crownstone as well as switch it via the cloud.
>
> You use this method if you want to get data related to the Crownstone. This does not request anything from the cloud by itself.


#### me() : User
>> returns User: This object allows you to get data related to your user.
>
> Use this to get the user object, from which you can get you userId, userData and location.



### Sphere
This class is not meant to be created directly, you get this from the CrownstoneCloud. It represents a single Sphere.

#### *async* data() : Promise\<cloud_Sphere>
>> returns cloud_Sphere: JSON containing the data of this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts) 
>
> This method will get the sphere data from the cloud.

#### *async* keys() : Promise\<cloud_Keys> 
>> returns cloud_Keys: JSON containing keys for this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts#L113) 
>
> These keys can be used for any bluetooth related operations

#### *async* locations() : Promise\<cloud_Location[]>  
>> returns cloud_Location[]: JSON containing the data for all locations in this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of the locations in your sphere.
>
#### *async* crownstones() : Promise\<cloud_Stone[]>  
>> returns cloud_Stone[]: JSON containing the data for all crownstones in this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of all Crownstones in this spheres.


#### *async* users() : Promise\<cloud_sphereUserDataSet>
>> returns cloud_sphereUserDataSet: JSON containing the data for all users in this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> Get all users in the Sphere.

#### *async* authorizationTokens() : Promise\<cloud_SphereAuthorizationTokens> 
>> returns cloud_SphereAuthorizationTokens: SON containing the data for all locations that match the filter. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts) 
>
> Used for hubs to get the tokens identifying users.

#### *async* presentPeople(ignoreDeviceId?: string) : Promise\<SpherePresentPeople[]>
>> returns SpherePresentPeople[]: JSON containing the data for the locations of all users in this sphere. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>>
>> ignoreDeviceId: optionally provide the ignoreDeviceId which is the device that will not be taken into account when determining the locations of the users.
>
> Used to get the locations of all users in the sphere

### Location
This class is not meant to be created directly, you get this from the CrownstoneCloud. It represents a single location.
 
 #### *async* data() : Promise\<cloud_Location[]>
 >> returns cloud_Location[]: JSON containing the data for all locations that match the filter. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts) 
 >
 > This method will get the location data from the cloud.
 
#### *async* crownstones() : Promise\<cloud_Stone[]>  
>> returns cloud_Stone[]: JSON containing the data for all crownstones in this Location. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts)
>
> You use this method to download the data of all Crownstones in this Location.


### Crownstone
This class is not meant to be created directly, you get this from the CrownstoneCloud. It represents a single Crownstone.
 
 #### *async* data() : Promise\<cloud_Stone>
 >> returns cloud_Stone: JSON containing the data for this specific Crownstone. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/cloudTypes.d.ts) 
 >
 > This method will get the Crownstone data from the cloud. 
 

#### *async* currentSwitchState() : Promise\<number> 
>> returns the current switchstate between 0 and 100.
>
>This assumes that there is only one Crownstone selected by the filter or that it came from crownstoneById. If not, an error will be thrown.

#### *async* setSwitch(percentage: number)
>> value: number between 0 and 100.
>
>This will switch the Crownstone(s) to the provided state. It will affect all Crownstones in the selection. Currently only 1 Crownstone supported.
 
#### *async* turnOn() 
>This will turn the Crownstones matching the filter conditions on. On respects any behaviour or twilight intensity preference, unlike setSwitch(100), which turns the Crownstone fully on.

#### *async* turnOff() 
>This will turn the Crownstones matching the filter conditions off.

#### *async* setMultiSwitch(switchData: SwitchData[])
 >> switchData: Array of SwitchData. Filtering before does not affect this method since everything is specified. [Type definition found here.](https://github.com/crownstone/crownstone-lib-nodejs-cloud/blob/master/src/declarations/declarations.d.ts)
 >
 > Use this method if you want to switch multiple Crownstones at the same time. 
 > NOT IMPLEMENTED YET