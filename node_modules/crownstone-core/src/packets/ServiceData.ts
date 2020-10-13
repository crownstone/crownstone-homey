import {parseOpCode3, parseOpCode4, parseOpCode5, parseOpCode6} from "./Parsers";
import {CrownstoneErrors} from "./CrownstoneErrors";
import {EncryptionHandler} from "../util/EncryptionHandler";
import {DeviceType} from "../protocol/CrownstoneTypes";
let aesjs = require('aes-js');

export class ServiceData {
  opCode             = 0;
  dataType           = 0;
  crownstoneId       = 0; 
  switchState        = 0;
  flagsBitmask       = 0;
  temperature        = 0;
  powerFactor        = 1;
  powerUsageReal     = 0;
  powerUsageApparent = 0;
  accumulatedEnergy  = 0;
  setupMode          = false;
  stateOfExternalCrownstone = false;

  data : Buffer;
  encryptedData : Buffer;
  encryptedDataStartIndex : number;

  dimmerReady;
  dimmingAllowed;
  hasError;
  switchLocked;

  partialTimestamp;
  timestamp;

  validation;

  errorTimestamp;
  errorsBitmask;
  errorMode;
  timeIsSet;
  switchCraftEnabled;
  tapToToggleEnabled;
  behaviourEnabled;
  behaviourOverridden;
  behaviourMasterHash;

  uniqueIdentifier;

  deviceType = 'undefined';
  rssiOfExternalCrownstone = 0;

  validData = false;
  dataReadyForUse = false; // decryption is successful


  constructor(data : Buffer, unencrypted = false) {
    this.data = data;
    this.validData = true;
    if (data.length === 18) {
      this.encryptedData = data.slice(2);
      this.encryptedDataStartIndex = 2
      this.opCode = this.data.readUInt8(0);
    }
    else if (data.length === 17) {
      this.encryptedData = data.slice(1);
      this.encryptedDataStartIndex = 1;
      this.opCode = this.data[0];
    }
    else if (data.length === 16 && unencrypted) {
      this.encryptedData = data;
      this.encryptedDataStartIndex = 0;
      this.opCode = 7;
    }
    else {
      this.validData = false;
    }
    this.getOperationMode();
  }

  getOperationMode() {
    if (this.validData) {
      switch (this.opCode) {
        case 4:
          this.setupMode = true;
          break;
        case 6:
          this.setupMode = true;
          this.getDeviceTypeFromPublicData();
          break;
        default:
          this.setupMode = false;
      }
    }
  }

  parse() {
    if (this.validData) {
      switch (this.opCode) {
        case 3:
          parseOpCode3(this, this.encryptedData);
          break;
        case 4:
          parseOpCode4(this, this.encryptedData);
          break;
        case 5:
        case 7:
          this.getDeviceTypeFromPublicData();
          parseOpCode5(this, this.encryptedData);
          break;
        case 6:
          this.getDeviceTypeFromPublicData();
          parseOpCode6(this, this.encryptedData);
          break;
        default:
          this.getDeviceTypeFromPublicData();
          parseOpCode5(this, this.encryptedData)
      }
    }
  }

  getDeviceTypeFromPublicData() {
    if (this.data.length == 18) {
      let deviceType = this.data.readUInt8(1);
      this.deviceType = DeviceType.getLabel(deviceType);
    }
    else {
      this.deviceType = 'undefined'
    }
  }

  hasCrownstoneDataFormat() {
    return this.validData;
  }

  getJSON() : ServiceDataJson {
    let errorsDictionary = new CrownstoneErrors(this.errorsBitmask).getJSON();
    let obj = {
      opCode                    : this.opCode,
      dataType                  : this.dataType,
      stateOfExternalCrownstone : this.stateOfExternalCrownstone,
      hasError                  : this.hasError,
      setupMode                 : this.isSetupPackage(),

      crownstoneId              : this.crownstoneId,
      switchState               : this.switchState,
      flagsBitmask              : this.flagsBitmask,
      temperature               : this.temperature,
      powerFactor               : this.powerFactor,
      powerUsageReal            : this.powerUsageReal,
      powerUsageApparent        : this.powerUsageApparent,
      accumulatedEnergy         : this.accumulatedEnergy,
      timestamp                 : this.timestamp,

      dimmerReady               : this.dimmerReady,
      dimmingAllowed            : this.dimmingAllowed,
      switchLocked              : this.switchLocked,
      switchCraftEnabled        : this.switchCraftEnabled,
      
      errorMode                 : this.errorMode,
      errors                    : errorsDictionary,

      behaviourOverridden       : this.behaviourOverridden,
      behaviourMasterHash       : this.behaviourMasterHash,
      behaviourEnabled          : this.behaviourEnabled,
      
      uniqueElement             : this.uniqueIdentifier,
      timeIsSet                 : this.timeIsSet,
      deviceType                : this.deviceType,
      rssiOfExternalCrownstone  : this.rssiOfExternalCrownstone
    };

    return obj;
  }

  isSetupPackage() {
    if (!this.validData) {
      return false
    }

    return this.setupMode
  }

  decrypt(key) {
    if (this.validData && this.encryptedData.length === 16) {
      let decrypted = EncryptionHandler.decryptAdvertisement(this.encryptedData, key);

      // copy decrypted data back in to data buffer.
      decrypted.copy(this.data, this.encryptedDataStartIndex);
      this.dataReadyForUse = true;
    }
  }
}