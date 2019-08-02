"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BleHandler_1 = require("./ble/BleHandler");
const BluenetSettings_1 = require("./BluenetSettings");
const EventBus_1 = require("./util/EventBus");
const ControlHandler_1 = require("./ble/modules/ControlHandler");
const CloudHandler_1 = require("./cloud/CloudHandler");
const SetupHandler_1 = require("./ble/modules/SetupHandler");

class Bluenet {
    constructor() {
        this.settings = new BluenetSettings_1.BluenetSettings();
        this.ble = new BleHandler_1.BleHandler(this.settings);
        this.control = new ControlHandler_1.ControlHandler(this.ble);
        this.setup = new SetupHandler_1.SetupHandler(this.ble);
        this.cloud = new CloudHandler_1.CloudHandler();
    }

    setApp(app) {
        this.app = app;
        this.app.log("Set reference to Homey app in bluenet lib");
        this.ble.setApp(app);
        this.control.setApp(app);
    }

    /**
     *
     * @param keys
     * @param {string} referenceId
     * @param {boolean} encryptionEnabled
     */
    setSettings(keys, referenceId = "BluenetNodeJSLib", encryptionEnabled = true) {
        this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId);
    }


    /*
     * Only link cloud of keys have not been found.
     */
    linkCloud(userData) {
        if (userData.adminKey !== undefined && userData.guestKey !== undefined) {
            return new Promise((resolve, reject) => {
                this.app.log("Keys found in userData, no need to link Cloud.");
                this.settings.loadKeys(true, userData.adminKey, userData.memberKey, userData.guestKey, "UserData");
                resolve();
            });
        }
        else {
            return this.cloud.login(userData)
                .then(() => {
                    return this.cloud.getKeys(userData.sphereId);
                })
                .then((keys) => {
                    this.settings.loadKeys(true, keys.admin, keys.member, keys.guest, "CloudData");
                });
        }
    }
    connect(connectData) {
        return this.ble.connect(connectData)
            .then(() => {
                this.app.log("Getting Session nonce...");
                return this.control.getAndSetSessionNonce();
        })
            .then(() => {
                this.app.log("Session nonce obtained");
        });
    }
    wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => { resolve(); }, seconds * 1000);
        });
    }
    setupCrownstone(handle, crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor) {
        return this.connect(handle)
            .then(() => {
                return this.setup.setup(crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor);
        });
    }
    disconnect() {
        return this.ble.disconnect();
    }
    on(topic, callback) {
        return EventBus_1.eventBus.on(topic, callback);
    }
}
exports.default = Bluenet;
//# sourceMappingURL=Bluenet.js.map
