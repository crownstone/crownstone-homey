# List of things to do

* The Crownstone Homey configuration screen asks for email address and password. This is a bit less nice than using OAuth. On the other hand, the information is residing on the Homey itself. It is not going to the Homey servers (or so you would hope).
* The configuration screen currently hardcodes a sphere id. This should be done in the code itself, where we shouldt query the Crownstone cloud for `users/$user_id/currentLocation` and use that to connect to devices.
* The discovery process for Crownstone's is called "pairing" by Homey. It is explained [here](https://apps.developer.athom.com/tutorial-Drivers-Pairing.html). The list of devices should be returned by `onPairListDevices` in `driver.js`. Ideally this will return all devices in the particular sphere where Homey resides. Subsequently, scanning for BLE devices can be done at regular times to set a device to available/unavailable.
* A device can implement `onCapabilityOnOff(value, opts, callback)`.

## Observations

* Certain devices (amongst which Crownstones) interleave connectable with non-connectable BLE advertisements. The connectable are necessary for devices to connect with it. The non-connectable are necessary for the iBeacon standard (operating in the background on iOS). 
* ManagerBLE with `find` and `discover` will only search for the first advertisement of a BLE device. If this happens to be a connectable one it will be able to connect. If it happens to be the one that is nonconnectable it will not be able to connect. It even seems that `noble` is caching these. There seems to be no way to keep scanning. The nonconnectable flag is never corrected afterward. After a reboot it might work. Or it might not. Again, this just depends on the first advertisement received from the device.
* ManagerBLE exposes only `discover` from `noble`, but not `startScanning`. The latter can be used to receive duplicate BLE advertisements (in Linux: `hcitool lescan --duplicates`). 

## Work-around

* I have reconfigured the Crownstone such that it emits nonconnectable advertisements using a different MAC address. 
* However, I can't upload it to the Crownstone because now the DFU is complaining that the binary is too large. Okay, used online config file and seems fine now.
* Mmm... Now I apparently didn't do it correctly yet. There are still connectable and nonconnectable messages.
* I thought I created a connectable even message: &= 0xFE and an nonconnectable odd message: |= 0x01. 

In this case DA:52:37:CB:06:5A is the even message.
In this case DA:52:37:CB:06:5B is the odd message.

Check through scanning using a whitelist:

    sudo hcitool lewladd --random DA:52:37:CB:06:5A
    sudo hcitool lescan --duplicates --passive --whitelist

In another shell:

    sudo hcidump --raw

You see the 6th value change from 00 to 03.

The default for this device is 5B. So, apparently so now and then an nonconnectable message is sent with the wrong MAC. Then I'll have to adjust the code in the firmware to make sure setting the MAC address is tightly done with restarting the advertisement.

First `sd_ble_gap_adv_stop`, then `sd_ble_gap_address_set` and then starting again.
