"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
const BluenetSettings = require('./BluenetSettings');
const BleHandler = require('./BleHandler');
const ControlHandler = require('./ControlHandler');
class Bluenet {
    constructor() {
        this.settings = new BluenetSettings.BluenetSettings();
        this.bleHandler = new BleHandler.BleHandler(this.settings);
        this.control = new ControlHandler.ControlHandler(this.bleHandler);
    }

    /**
     * This function will connect the Homey to the peripheral using a Homey advertisement as the connectData
     * and it will obtain the session nonce.
     */
    connect(connectData) {
        return this.bleHandler.connect(connectData)
            .then(() => {
                this.log('Getting Session nonce..');
                return this.control.getAndSetSessionNonce();
            })
            .then(() => {
                this.log('Session nonce obtained');
            });
    }

    /**
     * This function will disconnect the Homey from the peripheral
     */
    disconnect() {
        return this.bleHandler.disconnect();
    }
}
exports.default = Bluenet;
