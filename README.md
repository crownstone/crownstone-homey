# Homey Crownstone App

A Crownstone app to integrate with the Homey smart home hub. 

Open the Homey app and install the Crownstone app. Go to "Apps", press the plus sign at the right top corner and search
for "Crownstone".

Subsequently, Crownstone application appears.

![Crownstone in the Homey GUI](doc/homey-gui-crownstone-app.png)

If you click at the `Crownstone` text at the bottom left, you see a new dialog appear:

![Configuration of Crownstone in the Homey GUI](doc/homey-gui-crownstone-app-config.png)

## Home

The Homey does not have a concept of multiple homes. This is quite logical, because it is likely to be placed in one
physical location. Crownstones however are a network of devices that you can install in your own home, but also in
your garage, your holiday home, at your grandmother's, etc. Each home contains a **sphere** of Crownstones.

When installing the Crownstone app on the Homey, this app will query the Crownstone servers for your current location.
The discovery process will only return the Crownstones from this particular location. You will not be able to see
Crownstones from other locations.

This makes physical sense, the Bluetooth connections from the Homey only reach the Crownstones in its vicinity.

## Add Crownstones

It is necessary to add a Crownstone manually. Although the Crownstone code supports automatic discovery, in the setup at Homey the user manually selects a Crownstone from the list

![Homey: Add Crownstone type](doc/homey-gui-devices-zones.png)
![Homey: Add Crownstone](doc/homey-gui-add-device.png)
![Homey: Select Crownstone from list](doc/homey-gui-select-device.png)
![Homey: Crownstone added](doc/homey-gui-device-added.png)

## Control Crownstone

It is fairly simple to control the Crownstone.

![Crownstone add Device](doc/homey-gui-control-device.png)

Of course you can also say something like: "Okay Homey, turn on coffee machine" or in Dutch "Oke Homey, zet het koffieapparaat aan".

## On problems

Regretfully, there is very little support from Homey to check if an app runs properly. 
There is no user-facing logging for example. 
If you want to see logging, you have to install this app from github as a developer and run it from the command line with `homey app run`.

Bluetooth problems are at times resolved by restarting the Homey (from the System menu):

![Reset Homey](doc/homey-gui-restarting.png)

The system does obtain the real-time location of the smartphone. If this does not match the sphere where the 
Crowntones reside, it will run into trouble.



