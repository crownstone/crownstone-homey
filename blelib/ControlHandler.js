//todo: add bluenet errors, update logs, test service and characteristicsessionnonce, add documentation, test readCharacteristic()
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
//const Characteristics_1 = require("../../protocol/Characteristics");
//const Services_1 = require("../../protocol/Services");
const EncryptionHandler = require('./EncryptionHandler');
class ControlHandler {
    constructor(bleHandler) {
        this.ble = bleHandler;
        this.crownstoneServiceUUID = "24f000007d104805bfc17663a01c3bff";
        this.crownstoneCharacteristicsSessionNonce = "24f0000e7d104805bfc17663a01c3bff";
    }
    getAndSetSessionNonce() {
        //return this.ble.readCharacteristicWithoutEncryption(Services_1.CSServices.CrownstoneService, Characteristics_1.CrownstoneCharacteristics.SessionNonce)
        return this.ble.readCharacteristic(this.crownstoneServiceUUID, this.crownstoneCharacteristicsSessionNonce)
        //return this.ble.readCharacteristicWithoutEncryption(this.crownstoneServiceUUID, this.crownstoneCharacteristicsSessionNonce)
            .then((rawNonce) => {
                this.log('Got nonce!');
                let decryptedNonce = EncryptionHandler.EncryptionHandler.decryptSessionNonce(rawNonce, this.ble.settings.guestKey);
                this.log('Decrypted nonce', decryptedNonce);
                this.ble.settings.setSessionNonce(decryptedNonce);
                this.log('Set nonce');
            })
            .catch((err) => {
                this.log('Could not validate session nonce');
//                if (err.type == BluenetError_1.BluenetErrorType.COULD_NOT_VALIDATE_SESSION_NONCE) {
                throw err;
                //              }
            });
    }
}
exports.ControlHandler = ControlHandler;
