//todo: update logs, add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
const EncryptionHandler = require('./EncryptionHandler');
const ControlPackets = require('./ControlPackets');
class ControlHandler {
    constructor(bleHandler) {
        this.ble = bleHandler;
        this.crownstoneServiceUUID = '24f000007d104805bfc17663a01c3bff';
        this.crownstoneCharacteristicsSessionNonce = '24f0000e7d104805bfc17663a01c3bff';
        this.crownstoneCharacteristicsControl = '24f000017d104805bfc17663a01c3bff';
        //this.crownstoneCharacteristicsControl = '24f0000e7d104805bfc17663a01c3bff'
    }

    getAndSetSessionNonce() {
        return this.ble.readCharacteristic(this.crownstoneServiceUUID, this.crownstoneCharacteristicsSessionNonce)
            .then((rawNonce) => {
                console.log('Got nonce!');
                let decryptedNonce = EncryptionHandler.EncryptionHandler.decryptSessionNonce(rawNonce, this.ble.settings.basicKey);
                console.log('Decrypted nonce', decryptedNonce);
                this.ble.settings.setSessionNonce(decryptedNonce);
                console.log('Set nonce');
            })
            .catch((e) => {
                console.log('There was a problem validating the session nonce:', e);
                throw e;
            });
    }

    setSwitchState(state) {
        let switchState = state * 100;
        let packet = ControlPackets.ControlPacketsGenerator.getSwitchStatePacket(switchState);
        return this._writeControlPacket(packet);
    }

    _writeControlPacket(packet) {
        return this.ble.writeToCharacteristic(this.crownstoneServiceUUID, this.crownstoneCharacteristicsControl, packet);
    }
}
exports.ControlHandler = ControlHandler;
