// todo: add documentation, add 'encrypt'-function
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
const BluenetSettings = require('./BluenetSettings');
var crypto = require('crypto');
const aesjs = require('aes-js');
let BLOCK_LENGTH = 16;//
let NONCE_LENGTH = 16;
let SESSION_DATA_LENGTH = 5;//
let SESSION_KEY_LENGTH = 4;//
let PACKET_USER_LEVEL_LENGTH = 1;//
let PACKET_NONCE_LENGTH = 3;//
class EncryptionHandler {
    static decryptSessionNonce(rawNonce, key) {
        if (key.length !== 16) {
            throw ('INPUT_ERROR', 'Invalid Key', 500);
        }
        if (rawNonce.length !== 16) {
            throw ('INPUT_ERROR', 'Invalid Payload for Session Nonce decrypting', 500)
        }
        var aesEcb = new aesjs.ModeOfOperation.ecb(key);
        var decrypted = Buffer.from(aesEcb.decrypt(rawNonce));
        // start validation
        if (0xcafebabe === decrypted.readUInt32LE(0)) {
            return decrypted.slice(4, 4 + SESSION_DATA_LENGTH);
        } else {
            throw ('COULD_NOT_VALIDATE_SESSION_NONCE', 'Could not validate Session Nonce', 301);
        }
    }
    static encrypt(data, settings) {
        if (settings.sessionNonce == null) {
            throw "BleError.NO_SESSION_NONCE_SET";
        }
        if (settings.userLevel === BluenetSettings.UserLevel.unknown) {
            throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY";
        }
        // unpack the session data
        let sessionData = new SessionData(settings.sessionNonce);
        // create Nonce array
        let nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
        EncryptionHandler.fillWithRandomNumbers(nonce);
        let IV = EncryptionHandler.generateIV(nonce, sessionData.sessionNonce);
        let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
        IV.copy(counterBuffer, 0, 0);
        // get key
        let key = EncryptionHandler._getKey(settings.userLevel, settings);
        // get the packet size. This must fit the data and the session key and be an integer amount of blocks
        let packetSize = (data.length + SESSION_KEY_LENGTH) + BLOCK_LENGTH - (data.length + SESSION_KEY_LENGTH) % BLOCK_LENGTH;
        let paddedPayload = Buffer.alloc(packetSize);
        sessionData.validationKey.copy(paddedPayload, 0, 0, SESSION_KEY_LENGTH);
        // put the input data in the padded payload
        data.copy(paddedPayload, SESSION_KEY_LENGTH, 0);
        // do the actual encryption
        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
        let encryptedBytes = aesCtr.encrypt(paddedPayload);
        let encryptedBuffer = Buffer.from(encryptedBytes);
        // assemble the result package
        let result = Buffer.alloc(encryptedBytes.length + PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH);
        nonce.copy(result, 0, 0, PACKET_NONCE_LENGTH);
        result.writeUInt8(settings.userLevel, PACKET_NONCE_LENGTH);
        encryptedBuffer.copy(result, PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH, 0);
        return result;
    }
    static generateIV(packetNonce, sessionData) {
        if (packetNonce.length != PACKET_NONCE_LENGTH) {
            throw "BleError.INVALID_SIZE_FOR_SESSION_NONCE_PACKET";
        }
        let IV = Buffer.alloc(NONCE_LENGTH);
        // the IV used in the CTR mode is 8 bytes, the first 3 are random
        packetNonce.copy(IV, 0, 0);
        // the IV used in the CTR mode is 8 bytes, the last 5 are from the session data
        sessionData.copy(IV, PACKET_NONCE_LENGTH, 0);
        return IV;
    }
    static _getKey(userLevel, settings) {
        if (settings.initializedKeys == false && userLevel != BluenetSettings.UserLevel.setup) {
            throw "BleError.COULD_NOT_ENCRYPT_KEYS_NOT_SET";
        }
        let key = null;
        switch (userLevel) {
            case BluenetSettings.UserLevel.admin:
                key = settings.adminKey;
                break;
            case BluenetSettings.UserLevel.member:
                key = settings.memberKey;
                break;
            case BluenetSettings.UserLevel.guest:
                key = settings.basicKey;
                break;
            //case BluenetSettings.UserLevel.setup:
                //key = settings.setupKey;
                //break;
            default:
                throw "BleError.INVALID_KEY_FOR_ENCRYPTION";
        }
        if (key == null) {
            throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY";
        }
        if (key.length !== 16) {
            throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY";
        }
        return key;
    }
    static fillWithRandomNumbers(buff) {
        if (global["BLUENET_ENCRYPTION_TESTING"]) {
            for (let i = 0; i < buff.length; i++) {
                buff.writeUInt8(128, i);
            }
            return;
        }
        crypto.randomFillSync(buff, 0, buff.length);
    }
}
exports.EncryptionHandler = EncryptionHandler;
class SessionData {
    constructor(sessionData) {
        this.sessionNonce = null;
        this.validationKey = null;
        if (sessionData.length != SESSION_DATA_LENGTH) {
            throw "BleError.INVALID_SESSION_DATA";
        }
        this.sessionNonce = Buffer.from(sessionData);
        this.validationKey = this.sessionNonce.slice(0, 4);
    }
}
exports.SessionData = SessionData;