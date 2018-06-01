'use strict';

const Homey = require('homey');

class CrownstoneDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('Init Crownstone device');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        // register a capability listener
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('Crownstone added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('Crownstone deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        this.log('Set on/off');

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }

}

module.exports = CrownstoneDevice;
