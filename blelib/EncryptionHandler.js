// todo: add bluenet error, update logs, add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
const aes = require('aes-js');
let SESSION_DATA_LENGTH = 5;
class EncryptionHandler {
    static decryptSessionNonce(rawNonce, key) {
        if (key.length !== 16) {
            throw new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.INPUT_ERROR, 'Invalid Key');
        }
        if (rawNonce.length !== 16) {
            throw new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.INPUT_ERROR, 'Invalid Payload for sessionNonce decrypting!');
        }
        var aesEcb = new aes.ModeOfOperation.ecb(key);
        var decrypted = Buffer.from(aesEcb.decrypt(rawNonce));
        // start validation
        if (0xcafebabe === decrypted.readUInt32LE(0)) {
            return decrypted.slice(4, 4 + SESSION_DATA_LENGTH);
        } else {
            throw new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.COULD_NOT_VALIDATE_SESSION_NONCE, 'Could not validate Session Nonce', 301);
        }
    }
}
exports.EncryptionHandler = EncryptionHandler;
