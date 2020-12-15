Object.defineProperty(exports, "__esModule", { value: true });
//const Characteristics_1 = require("../../protocol/Characteristics");
//const Services_1 = require("../../protocol/Services");
//const EncryptionHandler_1 = require("../../util/EncryptionHandler");
class ControlHandler {
    constructor(bleHandler) {
        this.ble = bleHandler;
    }
    getAndSetSessionNonce() {
        return this.ble.readCharacteristicWithoutEncryption(Services_1.CSServices.CrownstoneService, Characteristics_1.CrownstoneCharacteristics.SessionNonce)
            .then((rawNonce) => {
                this.app.log("Got nonce!");
                let decryptedNonce = EncryptionHandler_1.EncryptionHandler.decryptSessionNonce(rawNonce, this.ble.settings.guestKey);
                this.app.log("Decrypted nonce", decryptedNonce);
                this.ble.settings.setSessionNonce(decryptedNonce);
                this.app.log("Set nonce");
            })
            .catch((err) => {
                this.app.log("Could not validate session nonce");
//                if (err.type == BluenetError_1.BluenetErrorType.COULD_NOT_VALIDATE_SESSION_NONCE) {
                throw err;
                //              }
            });
    }
}
exports.ControlHandler = ControlHandler;
