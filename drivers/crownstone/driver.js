'use strict';

const Homey = require('homey');

class CrownstoneDriver extends Homey.Driver {

    onInit() {
        super.onInit();

        this.log("Init Crownstone driver");
    }

    onPairListDevices( data, callback ){

        callback( null, [
            {
                name: 'Crownstone',
                data: {
                    id: 'crownstone'
                }
            }
        ]);

    }

}

module.exports = CrownstoneDriver;
