"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StoneTracker_1 = require("./StoneTracker");
const Topics_1 = require("../topics/Topics");
const EventBus_1 = require("../util/EventBus");
const Advertisement_1 = require("../packets/Advertisement");
const Services_1 = require("../protocol/Services");

class Scanner {
    constructor(settings) {
        this.nobleState = 'unknown';
        this.scanningInProgress = false;
        this.trackedStones = {};
        this.cache = {};
        this.settings = settings;
    }
    isReady() {
        return new Promise((resolve, reject) => {
            if (this.nobleState === 'poweredOn') {
                resolve();
            }
            else {
                let interval = setInterval(() => {
                    if (this.nobleState === 'poweredOn') {
                        clearInterval(interval);
                        resolve();
                    }
                    else if (this.nobleState !== 'unknown') {
                        clearInterval(interval);
                        reject("Noble State (BLE-handling-lib) is not usable: " + this.nobleState);
                    }
                }, 500);
            }
        });
    }
    start() {
        return this.isReady()
            .then(() => {
            if (this.scanningInProgress !== true) {
                this.scanningInProgress = true;
                noble.startScanning([Services_1.CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID, Services_1.CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID, Services_1.CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID], true);
            }
        });
    }
    stop() {
        if (this.scanningInProgress) {
            noble.stopScanning();
            this.scanningInProgress = false;
        }
    }
    cleanUp() {
        noble.removeAllListeners();
    }
    /**
     * Check if this uuid is in the cache. If it is not, we will scan for 3 seconds to find it!
     * @param identifier
     * @returns {Promise<any>}
     */
    getPeripheral(identifier, scanDuration = 15000) {
        return new Promise((resolve, reject) => {
            if (this.cache[identifier] === undefined) {
                let timeout = null;
                console.log("Peripheral not cached. Starting scan...");
                this.start()
                    .then(() => {
                    console.log("Scan started...");
                    let unsubscribe = EventBus_1.eventBus.on(Topics_1.Topics.peripheralDiscovered, (peripheral) => {
                        // found a match!
                        if (peripheral.uuid === identifier || peripheral.address === identifier) {
                            // success! stop the timeout.
                            clearTimeout(timeout);
                            // unsub from this event
                            unsubscribe();
                            // here it is!
                            noble.once('scanStop', () => { setTimeout(() => { resolve(peripheral); }, 500); });
                            // stop scanning
                            this.stop();
                        }
                    });
                    // scan for 3 seconds for this uuid, then stop and fail.
                    timeout = setTimeout(() => { unsubscribe(); reject(null); this.stop(); }, scanDuration);
                });
            }
            else {
                resolve(this.cache[identifier].peripheral);
            }
        })
            .catch((err) => {
            console.log("Could not find Peripheral.");
            throw err;
        });
    }
    /**
     * This can be either an iBeacon payload, a scanresponse or both combined.
     * @type {Advertisement}
     */
    discover(peripheral) {
        EventBus_1.eventBus.emit(Topics_1.Topics.peripheralDiscovered, peripheral);
        let advertisement = new Advertisement_1.Advertisement(peripheral, this.settings.referenceId);
        if (!advertisement.serviceDataAvailable) {
            return;
        }
        // decrypt the advertisement
        if (this.settings.encryptionEnabled) {
            advertisement.decrypt(this.settings.guestKey);
        }
        else {
            advertisement.setReadyForUse();
        }
        // parse the service data
        advertisement.process();
        this.cache[peripheral.uuid] = { advertisement: advertisement, peripheral: peripheral };
        this.cache[peripheral.address] = { advertisement: advertisement, peripheral: peripheral };
        if (this.trackedStones[advertisement.id] === undefined) {
            this.trackedStones[advertisement.id] = new StoneTracker_1.StoneTracker();
        }
        this.trackedStones[advertisement.id].update(advertisement);
        EventBus_1.eventBus.emit(Topics_1.Topics.advertisement, advertisement.getJSON());
        if (this.trackedStones[advertisement.id].verified) {
            EventBus_1.eventBus.emit(Topics_1.Topics.verifiedAdvertisement, advertisement.getJSON());
        }
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=Scanner.js.map