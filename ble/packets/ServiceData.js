"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parsers_1 = require("./Parsers");
const CrownstoneErrors_1 = require("./CrownstoneErrors");
const EncryptionHandler_1 = require("../util/EncryptionHandler");
let aesjs = require('aes-js');
class ServiceData {
    constructor(data) {
        this.opCode = 0;
        this.dataType = 0;
        this.crownstoneId = 0;
        this.switchState = 0;
        this.flagsBitmask = 0;
        this.temperature = 0;
        this.powerFactor = 1;
        this.powerUsageReal = 0;
        this.powerUsageApparent = 0;
        this.accumulatedEnergy = 0;
        this.setupMode = false;
        this.stateOfExternalCrownstone = false;
        this.deviceType = 'undefined';
        this.rssiOfExternalCrownstone = 0;
        this.validData = false;
        this.dataReadyForUse = false; // decryption is successful
        this.data = data;
        this.validData = true;
        if (data.length === 18) {
            this.encryptedData = data.slice(2);
            this.encryptedDataStartIndex = 2;
        }
        else if (data.length === 17) {
            this.encryptedData = data.slice(1);
            this.encryptedDataStartIndex = 1;
        }
        else {
            this.validData = false;
        }
    }
    parse() {
        this.validData = true;
        if (this.data.length === 18) {
            this.opCode = this.data.readUInt8(0);
            switch (this.opCode) {
                case 5:
                    Parsers_1.parseOpCode5(this, this.data);
                    break;
                case 6:
                    Parsers_1.parseOpCode6(this, this.data);
                    break;
                default:
                    Parsers_1.parseOpCode5(this, this.data);
            }
        }
        else if (this.data.length === 17) {
            this.opCode = this.data[0];
            switch (this.opCode) {
                case 3:
                    Parsers_1.parseOpCode3(this, this.data);
                    break;
                case 4:
                    Parsers_1.parseOpCode4(this, this.data);
                    break;
                default:
                    Parsers_1.parseOpCode3(this, this.data);
            }
        }
        else {
            this.validData = false;
        }
    }
    hasCrownstoneDataFormat() {
        return this.validData;
    }
    getJSON() {
        let errorsDictionary = new CrownstoneErrors_1.CrownstoneErrors(this.errorsBitmask).getJSON();
        let obj = {
            opCode: this.opCode,
            dataType: this.dataType,
            stateOfExternalCrownstone: this.stateOfExternalCrownstone,
            hasError: this.hasError,
            setupMode: this.isSetupPackage(),
            crownstoneId: this.crownstoneId,
            switchState: this.switchState,
            flagsBitmask: this.flagsBitmask,
            temperature: this.temperature,
            powerFactor: this.powerFactor,
            powerUsageReal: this.powerUsageReal,
            powerUsageApparent: this.powerUsageApparent,
            accumulatedEnergy: this.accumulatedEnergy,
            timestamp: this.timestamp,
            dimmingAvailable: this.dimmingAvailable,
            dimmingAllowed: this.dimmingAllowed,
            switchLocked: this.switchLocked,
            switchCraftEnabled: this.switchCraftEnabled,
            errorMode: this.errorMode,
            errors: errorsDictionary,
            uniqueElement: this.uniqueIdentifier,
            timeIsSet: this.timeIsSet,
            deviceType: this.deviceType,
            rssiOfExternalCrownstone: this.rssiOfExternalCrownstone
        };
        return obj;
    }
    isSetupPackage() {
        if (!this.validData) {
            return false;
        }
        return this.setupMode;
    }
    decrypt(key) {
        if (this.validData && this.encryptedData.length === 16) {
            let decrypted = EncryptionHandler_1.EncryptionHandler.decryptAdvertisement(this.encryptedData, key);
            // copy decrypted data back in to data buffer.
            decrypted.copy(this.data, this.encryptedDataStartIndex);
            this.dataReadyForUse = true;
        }
    }
}
exports.ServiceData = ServiceData;
//# sourceMappingURL=ServiceData.js.map