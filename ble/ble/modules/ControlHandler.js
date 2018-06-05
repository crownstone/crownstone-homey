"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Characteristics_1 = require("../../protocol/Characteristics");
const Services_1 = require("../../protocol/Services");
const EncryptionHandler_1 = require("../../util/EncryptionHandler");
const ControlPackets_1 = require("../../protocol/ControlPackets");
const BluenetError_1 = require("../../BluenetError");
class ControlHandler {
    constructor(ble) {
        this.ble = ble;
    }
    getAndSetSessionNonce() {
        return this.ble.readCharacteristicWithoutEncryption(Services_1.CSServices.CrownstoneService, Characteristics_1.CrownstoneCharacteristics.SessionNonce)
            .then((rawNonce) => {
            console.log("Got Nonce!");
            let decryptedNonce = EncryptionHandler_1.EncryptionHandler.decryptSessionNonce(rawNonce, this.ble.settings.guestKey);
            console.log("Decrypted Nonce", decryptedNonce);
            this.ble.settings.setSessionNonce(decryptedNonce);
            console.log("Set Nonce");
        })
            .catch((err) => {
            if (err.type == BluenetError_1.BluenetErrorType.COULD_NOT_VALIDATE_SESSION_NONCE) {
                throw err;
            }
        });
    }
    setSwitchState(state) {
        let switchState = state * 100;
        let packet = ControlPackets_1.ControlPacketsGenerator.getSwitchStatePacket(switchState);
        return this._writeControlPacket(packet);
    }
    commandFactoryReset() {
        let packet = ControlPackets_1.ControlPacketsGenerator.getCommandFactoryResetPacket();
        return this._writeControlPacket(packet);
    }
    disconnect() {
        let packet = ControlPackets_1.ControlPacketsGenerator.getDisconnectPacket();
        return this._writeControlPacket(packet);
    }
    _writeControlPacket(packet) {
        return this.ble.writeToCharacteristic(Services_1.CSServices.CrownstoneService, Characteristics_1.CrownstoneCharacteristics.Control, packet);
    }
}
exports.ControlHandler = ControlHandler;
//# sourceMappingURL=ControlHandler.js.map