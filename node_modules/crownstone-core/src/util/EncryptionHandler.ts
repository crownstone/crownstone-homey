import {CrownstoneError} from "../protocol/CrownstoneError";
import {CrownstoneErrorType, UserLevel} from "../declarations/enums";
import {CrownstoneSettings} from "../containers/CrownstoneSettings";

const crypto = require('crypto');
const aesjs = require('aes-js');



let BLOCK_LENGTH             = 16;
let NONCE_LENGTH             = 16;
let SESSION_DATA_LENGTH      = 5;
let SESSION_KEY_LENGTH       = 4;
let MESSAGE_SIZE_LENGTH      = 4;
let PACKET_USER_LEVEL_LENGTH = 1;
let PACKET_NONCE_LENGTH      = 3;
let CHECKSUM                 = 0xcafebabe;

let BLUENET_ENCRYPTION_TESTING = false;


class AESCounter {
  _counter : Uint8Array;

  constructor( IV : Buffer ) {
    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    this._counter = new Uint8Array(counterBuffer);
  }

  increment() {
    // we'll never need more than 256*16 bytes
    this._counter[BLOCK_LENGTH-1]++;
  }


}

export class EncryptionHandler {

  static decryptSessionNonce(rawNonce: Buffer, key: Buffer) {
    if (key.length      !== 16) { throw new CrownstoneError(CrownstoneErrorType.INPUT_ERROR, "Invalid Key"); }
    if (rawNonce.length !== 16) { throw new CrownstoneError(CrownstoneErrorType.INPUT_ERROR, "Invalid Payload for sessionNonce decrypting!"); }

    const aesEcb = new aesjs.ModeOfOperation.ecb(key);
    const decrypted = Buffer.from(aesEcb.decrypt(rawNonce));

    // start validation
    if (0xcafebabe === decrypted.readUInt32LE(0)) {
      return decrypted.slice(4,4+SESSION_DATA_LENGTH);
    }
    else {
      throw new CrownstoneError(CrownstoneErrorType.COULD_NOT_VALIDATE_SESSION_NONCE, "Could not validate Session Nonce", 301);
    }
  }



  // static encrypt( data : Buffer, settings : CrownstoneSettings ) {
  //   if (settings.sessionNonce == null) {
  //     throw "BleError.NO_SESSION_NONCE_SET";
  //   }
  //
  //   if (settings.userLevel == UserLevel.unknown) {
  //     throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY";
  //   }
  //
  //   // unpack the session data
  //   let sessionData = new SessionData(settings.sessionNonce);
  //
  //   // create Nonce array
  //   let nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
  //   EncryptionHandler.fillWithRandomNumbers(nonce);
  //
  //   let IV = EncryptionHandler.generateIV(nonce, sessionData.sessionNonce);
  //   let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
  //   IV.copy(counterBuffer,0,0);
  //
  //   // get key
  //   let key = EncryptionHandler._getKey(settings.userLevel, settings);
  //
  //   // get the packet size. This must fit the data and the session key and be an integer amount of blocks
  //   let packetSize = (data.length + SESSION_KEY_LENGTH) + BLOCK_LENGTH - (data.length + SESSION_KEY_LENGTH) % BLOCK_LENGTH;
  //
  //   let paddedPayload = Buffer.alloc(packetSize);
  //   sessionData.validationKey.copy(paddedPayload,0,0,SESSION_KEY_LENGTH);
  //
  //   // put the input data in the padded payload
  //   data.copy(paddedPayload,SESSION_KEY_LENGTH, 0);
  //
  //   // do the actual encryption
  //   let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
  //   let encryptedBytes = aesCtr.encrypt(paddedPayload);
  //   let encryptedBuffer = Buffer.from(encryptedBytes);
  //
  //   // assemble the result package
  //   let result = Buffer.alloc(encryptedBytes.length + PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH);
  //   nonce.copy(result, 0,0, PACKET_NONCE_LENGTH);
  //   result.writeUInt8(settings.userLevel, PACKET_NONCE_LENGTH);
  //   encryptedBuffer.copy(result, PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH,0);
  //
  //   return result;
  // }

  // static decrypt( data: Buffer, settings: CrownstoneSettings ) {
  //   if (settings.sessionNonce == null) {
  //     throw "BleError.NO_SESSION_NONCE_SET"
  //   }
  //
  //   // unpack the session data
  //   let sessionData = new SessionData(settings.sessionNonce);
  //
  //   // decrypt data
  //   let decrypted = EncryptionHandler._decrypt(data, sessionData, settings);
  //   // verify decryption success and strip checksum
  //   let result = EncryptionHandler._verifyDecryption(decrypted, sessionData);
  //
  //   return result;
  // }


  static _decrypt(data : Buffer, sessionData: SessionData, settings: CrownstoneSettings) {
    let encryptedPackage = new EncryptedPackage(data);

    let key = EncryptionHandler._getKey(encryptedPackage.userLevel, settings);

    let IV = EncryptionHandler.generateIV(encryptedPackage.nonce, sessionData.sessionNonce);

    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    // do the actual encryption
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
    let decryptedBytes = aesCtr.decrypt(encryptedPackage.getPayload());

    return Buffer.from(decryptedBytes);
  }


  static decryptCTR(data : Buffer, sessionData: SessionData, key: Buffer ) {
    let encryptedPackage = new EncryptedPackage(data);

    let IV = EncryptionHandler.generateIV(encryptedPackage.nonce, sessionData.sessionNonce);

    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    // do the actual encryption
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
    let decryptedBytes = aesCtr.decrypt(encryptedPackage.getPayload());

    return Buffer.from(decryptedBytes);
  }

  static encryptCTR(data : Buffer, sessionData: SessionData, key: Buffer, keyIndex: number) {
    // create Nonce array
    let nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
    EncryptionHandler.fillWithRandomNumbers(nonce);

    let IV = EncryptionHandler.generateIV(nonce, sessionData.sessionNonce);
    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    // get the packet size. This must fit the data and the session key and be an integer amount of blocks
    let overheadSize = SESSION_KEY_LENGTH + MESSAGE_SIZE_LENGTH;
    let packetSize = (data.length + overheadSize) + BLOCK_LENGTH - (data.length + overheadSize) % BLOCK_LENGTH;

    // create the padded payload
    let paddedPayload = Buffer.alloc(packetSize, 0);

    // copy the validation key into the buffer.
    sessionData.validationKey.copy(paddedPayload,0,0,overheadSize);

    // write the length into the buffer.
    paddedPayload.writeUInt16LE(data.length, SESSION_KEY_LENGTH);

    // put the input data in the padded payload
    data.copy(paddedPayload,overheadSize, 0);

    // do the actual encryption
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
    let encryptedBytes = aesCtr.encrypt(paddedPayload);
    let encryptedBuffer = Buffer.from(encryptedBytes);

    // assemble the result package
    let result = Buffer.alloc(encryptedBytes.length + PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH);

    nonce.copy(result, 0,0, PACKET_NONCE_LENGTH);
    result.writeUInt8(keyIndex, PACKET_NONCE_LENGTH);
    encryptedBuffer.copy(result, PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH,0);

    return result;
  }


  static verifyAndExtractDecryption(decrypted : Buffer, sessionData: SessionData) {
    if (decrypted.readUInt32LE(0) === sessionData.validationKey.readUInt32LE(0)) {
      // remove checksum from decyption and return payload
      let result = Buffer.alloc(decrypted.length - SESSION_KEY_LENGTH);
      decrypted.copy(result,0, SESSION_KEY_LENGTH);
      return result
    }
    else {
      throw 'BleError.COULD_NOT_DECRYPT'
    }
  }


  static decryptAdvertisement(data, key) {
    let aesEcb = new aesjs.ModeOfOperation.ecb(key);

    let decrypted = aesEcb.decrypt(data);
    // convert from UInt8Array to Buffer
    let decryptedBuffer = Buffer.from(decrypted);
    return decryptedBuffer;
  }


  static generateIV(packetNonce: Buffer, sessionData: Buffer) : Buffer {
    if (packetNonce.length != PACKET_NONCE_LENGTH) {
      throw "BleError.INVALID_SIZE_FOR_SESSION_NONCE_PACKET"
    }

    let IV = Buffer.alloc(NONCE_LENGTH);

    // the IV used in the CTR mode is 8 bytes, the first 3 are random
    packetNonce.copy(IV,0,0);

    // the IV used in the CTR mode is 8 bytes, the last 5 are from the session data
    sessionData.copy(IV,PACKET_NONCE_LENGTH,0);

    return IV;
  }


  static _getKey(userLevel, settings: CrownstoneSettings) : Buffer {
    if (settings.initializedKeys == false && userLevel != UserLevel.setup) {
      throw "BleError.COULD_NOT_ENCRYPT_KEYS_NOT_SET"
    }

    let key = null;
    switch (userLevel) {
      case UserLevel.admin:
        key = settings.adminKey;
        break;
      case UserLevel.member:
        key = settings.memberKey;
        break;
      case UserLevel.basic:
        key = settings.basicKey;
        break;
      case UserLevel.setup:
        key = settings.setupKey;
        break;
      default:
        throw "BleError.INVALID_KEY_FOR_ENCRYPTION"
    }

    if (key == null) {
      throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY"
    }

    if (key.length !== 16) {
      throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY"
    }

    return key
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


export class SessionData {
  sessionNonce  = null;
  validationKey = null;

  constructor(sessionData : number[] | Buffer = null) {
    if (sessionData !== null) {
      this.load(sessionData)
    }
  }

  load(data : number[] | Buffer) {
    if (data.length != SESSION_DATA_LENGTH) {
      throw "BleError.INVALID_SESSION_DATA"
    }
    if (data instanceof Buffer) {
      this.sessionNonce = data;
    }
    else {
      this.sessionNonce = Buffer.from(data);
    }
    this.validationKey = this.sessionNonce.slice(0,4);
  }

  generate() {
    let data = Buffer.alloc(5);
    EncryptionHandler.fillWithRandomNumbers(data);
    this.load(data);
  }
}


export class EncryptedPackageBase {
  nonce     : Buffer = null;
  keyId     : number = null;
  payload   : Buffer = null;

  constructor(data : Buffer) {
     this.parseData(data)
  }

  parseData(data: Buffer)  {
    let prefixLength = PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH;
    if (data.length < prefixLength) {
      throw 'BleError.INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT'
    }

    this.nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
    data.copy(this.nonce, 0,0, PACKET_NONCE_LENGTH);
    // 20 is the minimal size of a packet (3+1+16)
    if (data.length < 20) {
      throw 'BleError.INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT'
    }

    this.keyId = data.readUInt8(PACKET_NONCE_LENGTH);

    let payloadData = Buffer.alloc(data.length - prefixLength);
    data.copy(payloadData, 0, prefixLength, data.length);

    if (payloadData.length % 16 != 0) {
      throw 'BleError.INVALID_SIZE_FOR_ENCRYPTED_PAYLOAD'
    }

    this.payload = payloadData;
  }


  getPayload() : Buffer {
    if (this.payload != null) {
      return this.payload;
    }
    throw "BleError.CAN_NOT_GET_PAYLOAD"
  }
}


export class EncryptedPackage extends EncryptedPackageBase {
  userLevel : number = null;

  constructor(data : Buffer) {
    super(data);
    this.userLevel = this.keyId;
    this.validatePayload()
  }

  validatePayload() {
    // only allow 0, 1, 2 for Admin, User, Guest and 100 for Setup
    if (this.userLevel > 2 && this.userLevel != UserLevel.setup) {
      throw 'BleError.INVALID_KEY_FOR_ENCRYPTION'
    }
  }
}
