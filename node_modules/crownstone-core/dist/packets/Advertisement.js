"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Services_1 = require("../protocol/Services");
const ServiceData_1 = require("./ServiceData");
class Advertisement {
    constructor(rawAdvertisement, referenceId) {
        this.id = null;
        this.name = null;
        this.handle = null;
        this.address = null;
        this.rssi = null;
        this.referenceId = null;
        this.serviceDataAvailable = false;
        this.serviceUUID = null;
        this.scanResponse = null;
        this.referenceId = referenceId;
        this.parse(rawAdvertisement);
    }
    parse(rawAdvertisement) {
        this.id = rawAdvertisement.id;
        this.handle = rawAdvertisement.uuid;
        this.address = rawAdvertisement.address;
        this.name = rawAdvertisement.name;
        this.rssi = rawAdvertisement.rssi;
        let serviceDataArray = rawAdvertisement.advertisement.serviceData;
        for (let i = 0; i < serviceDataArray.length; i++) {
            if (!serviceDataArray[i]) {
                continue;
            }
            let uuid = serviceDataArray[i].uuid.toLowerCase();
            if (Services_1.ServiceUUIDArray.indexOf(uuid) !== -1) {
                this.serviceDataAvailable = true;
                this.serviceUUID = uuid;
                this.scanResponse = new ServiceData_1.ServiceData(serviceDataArray[i].data);
                break;
            }
        }
    }
    isSetupPackage() {
        if (this.scanResponse) {
            return this.scanResponse.setupMode;
        }
        return false;
    }
    isInDFUMode() {
        // console.log("isInDFUMode not implemented yet.")
        return false;
    }
    isCrownstoneFamily() {
        if (this.scanResponse) {
            return this.scanResponse.hasCrownstoneDataFormat();
        }
        return false;
    }
    decrypt(key) {
        if (!key) {
            throw "Encryption is enabled but no basic key is provided!";
        }
        if (this.scanResponse) {
            this.scanResponse.decrypt(key);
        }
    }
    process() {
        if (this.scanResponse) {
            this.scanResponse.parse();
        }
    }
    hasScanResponse() {
        return (this.serviceDataAvailable && this.scanResponse != null);
    }
    setReadyForUse() {
        if (this.scanResponse) {
            this.scanResponse.dataReadyForUse = true;
        }
    }
    getJSON() {
        let obj = {
            handle: this.handle,
            address: this.address,
            name: this.name,
            rssi: this.rssi,
            isCrownstoneFamily: this.isCrownstoneFamily(),
            isInDFUMode: this.isInDFUMode(),
            referenceId: this.referenceId
        };
        if (this.serviceUUID !== null) {
            obj["serviceUUID"] = this.serviceUUID;
        }
        if (this.serviceDataAvailable) {
            if (this.isCrownstoneFamily) {
                obj["serviceData"] = this.scanResponse.getJSON();
            }
        }
        return obj;
    }
}
exports.Advertisement = Advertisement;
//# sourceMappingURL=Advertisement.js.map