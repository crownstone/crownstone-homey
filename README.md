# Homey Crownstone App

A Crownstone app to integrate with the Homey smart home hub.

Here you can find the step-by-step tutorial to get started with the app.

## Home

The Homey does not have a concept of multiple homes. This is quite logical, because it is likely to be placed in one
physical location. Crownstones however are a network of devices that you can install in your own home, but also in
your garage, your holiday home, at your grandmother's, etc. Each home contains a **sphere** of Crownstones.

When installing the Crownstone app on the Homey, this app will query the Crownstone servers for your current location.
The discovery process will only return the Crownstones from this particular location. You will not be able to see
Crownstones from other locations. Make sure to activate the Crownstone App and enable location to obtain the Crownstones.

This makes physical sense, the Bluetooth connections from the Homey only reach the Crownstones in its vicinity.

## Homey app

You need the Homey app to install the Crownstone software from the Homey app store.

<img src="doc/user_overview.jpg" alt="User overview in the Homey app" width="180" height="400">

You can install the app like you normally would do for other apps on the Homey as well. Go to "Apps" and click the "+" sign at the top right corner. In the end you will have the app installed.

<img src="doc/app_store.jpg" alt="Homey app store" width="180" height="400"><img src="doc/app_store_search.jpg" alt="Search the app store" width="180" height="400"><img src="doc/app_installed.jpg" alt="Have the Crownstone app installed" width="180" height="400">

There is no need to configure the app, press the top left arrow to go back to the menu if you see the below screen.

<img src="doc/app_configure.jpg" alt="No need to configure the app" width="180" height="400">

## Adding devices

For adding devices you click the second icon at the bottom.

<img src="doc/add_devices.jpg" alt="Add devices" width="180" height="400">

Now click on the `+` in the top right corner or on the `Add my first device` text in the middle (if it is your first device). You will have to select Crownstone and click through a few times.

<img src="doc/add_devices_select_crownstone.jpg" alt="Add devices and select Crownstone" width="180" height="400"><img src="doc/add_devices_select_crownstone1.jpg" alt="Add devices and select Crownstone" width="180" height="400"><img src="doc/add_devices_select_crownstone2.jpg" alt="Add devices and select Crownstone" width="180" height="400">

When adding devices for the first time, you'll be asked to log in to your Crownstone account. It will retrieve information about your Crownstone devices from the cloud.

<img src="doc/login.jpg" alt="Login to the Crownstone servers" width="180" height="400">

Enter your credentials and select the Crownstone devices you want to add.

<img src="doc/device_list.jpg" alt="List of Crownstone devices to choose from" width="180" height="400"><img src="doc/device_being_added.jpg" alt="Devices to be added, can take a while" width="180" height="400">

Now you will have a list of devices, all in the `Home` zone:

<img src="doc/devices.jpg" alt="Device overview" width="180" height="400">

## Using devices

If you click a device you directly control it. You can also long-press an icon, for example to dim it.

<img src="doc/dim_light.jpg" alt="Dim device" width="180" height="400">

There are a few settings you can change per device. For example the `zone` and what's plugged in to it.

<img src="doc/device_settings.jpg" alt="Change device settings" width="180" height="400"><img src="doc/zones.jpg" alt="Choose a zone" width="180" height="400"><img src="doc/device_plugged_in.jpg" alt="Select what is plugged into the socket" width="180" height="400">

Crownstone can be **locked**. Those Crownstone cannot be controlled from the Homey. If you want to control such a Crownstone you will see a message like this.

<img src="doc/locked.jpg" alt="Locked message" width="180" height="400">

The result can be compared with the Crownstone app:

<img src="doc/crownstone_app.jpg" alt="Locked message" width="180" height="400"><img src="doc/homey_app.jpg" alt="Locked message" width="180" height="400">

## Flows

You can also create flows within the Homey. This works like follows.

<img src="doc/flow1.jpg" alt="Create a flow" width="180" height="400"><img src="doc/flow2.jpg" alt="Create a flow" width="180" height="400"><img src="doc/flow3.jpg" alt="Create a flow" width="180" height="400"><img src="doc/flow4.jpg" alt="Create a flow" width="180" height="400"><img src="doc/flow5.jpg" alt="Create a flow" width="180" height="400">

Using flows you can have all kind of actions coupled to events such as that someone enters a room or leaves the house.

## Developer settings

You can select if the Crownstone should be switched using the Crownstone cloud or using Bluetooth LE. The latter is an experimental setting and should not be used yet. By default only the cloud is used.
