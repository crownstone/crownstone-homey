'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const EncryptionHandler = require('./EncryptionHandler');
const ControlPackets = require('./ControlPackets');
class ControlHandler {
    constructor(bleHandler) {
        this.ble = bleHandler;
        this.crownstoneServiceUUID = '24f000007d104805bfc17663a01c3bff';
        this.crownstoneCharacteristicsSessionNonce = '24f0000e7d104805bfc17663a01c3bff';
        this.crownstoneCharacteristicsControl = '24f0000c7d104805bfc17663a01c3bff';
    }

    /**
     * This method will obtain the session nonce and validation key and set it in the settings.
     */
    getAndSetSessionData() {
        return this.ble.readCharacteristic(this.crownstoneServiceUUID, this.crownstoneCharacteristicsSessionNonce)
            .then((rawNonce) => {
                let decryptedNonce = EncryptionHandler.EncryptionHandler.decryptSessionData(rawNonce, this.ble.settings.basicKey);
                let decryptedSessionNonce = decryptedNonce.slice(0, 5);
                let decryptedValidationkey = decryptedNonce.slice(5, 9);
                // this.ble.settings.setSessionNonce(decryptedNonce.slice(0, 5));
                // this.ble.settings.setValidationKey(decryptedNonce.slice(5, 9));
                this.ble.settings.setSessionNonce(decryptedSessionNonce);
                this.ble.settings.setValidationKey(decryptedValidationkey)
            })
            .catch((e) => {
                console.log('There was a problem validating the session data:', e);
                throw e;
            });
    }

    /**
     * This method will return a control packet to switch a device to a certain value.
     */
    setSwitchState(state) {
        let switchState = state * 100;
        let packet = ControlPackets.ControlPacketsGenerator.getSwitchStatePacket(switchState);
        return this._writeControlPacket(packet);
    }

    /**
     * This method will call the method to write the control packet for given serviceUuid,
     * characteristicUuid and packet.
     */
    _writeControlPacket(packet) {
        return this.ble.writeToCharacteristic(this.crownstoneServiceUUID, this.crownstoneCharacteristicsControl, packet);
    }

    /**
     * This method will disconnect the device.
     */
    disconnect() {
        let packet = ControlPackets.ControlPacketsGenerator.getDisconnectPacket();
        return this._writeControlPacket(packet)
            .then(() => {
                let sessionId = this.ble.connectionSessionId;
                setTimeout(() => {
                    if (sessionId === this.ble.connectionSessionId) {
                        console.log('Forcing cleanup after disconnect');
                        if (this.ble.connectedPeripheral !== null) {
                            this.ble.connectedPeripheral = null;
                        }
                    }
                }, 2000);
            });
    }
}
exports.ControlHandler = ControlHandler;
