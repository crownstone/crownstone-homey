"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BluenetSettings_1 = require("./BluenetSettings");
const EventBus_1 = require("./util/EventBus");
const CloudHandler_1 = require("./cloud/CloudHandler");
const Topics_1 = require("./topics/Topics");
class Bluenet {
    constructor() {
        this.settings = new BluenetSettings_1.BluenetSettings();
        this.cloud = new CloudHandler_1.CloudHandler();
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

    linkCloud(userData) {
        if (userData.adminKey !== undefined && userData.guestKey !== undefined) {
            return new Promise((resolve, reject) => {
                console.log("Keys found in userData, no need to link Cloud.");
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
    wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => { resolve(); }, seconds * 1000);
        });
    }
    on(topic, callback) {
        return EventBus_1.eventBus.on(topic, callback);
    }
}
exports.default = Bluenet;
//# sourceMappingURL=Bluenet.js.map