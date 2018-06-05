// import { StoneTracker }      from "./StoneTracker";
// import { Topics }            from "../topics/Topics";
// import { eventBus }          from "../util/EventBus";
// import { Advertisement }     from "../packets/Advertisement";
// import { BluenetSettings }   from "../BluenetSettings";
// import { TrackerMap, Cache } from "../types/declarations";
// import {
//   CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID,
//   CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID,
//   CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID
// } from "../protocol/Services";
// import {publicDecrypt} from "crypto";
//
// var noble = require('noble');
//
// export class Scanner {
//
//   nobleState = 'unknown';
//   scanningInProgress = false;
//   trackedStones : TrackerMap = {};
//   cache : Cache = {};
//   settings : BluenetSettings;
//
//   constructor(settings : BluenetSettings) {
//     this.settings = settings;
//
//     // <"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn">
//     noble.on('stateChange', (state) => {
//       console.log("Noble State Changed", state);
//       this.nobleState = state;
//     });
//
//     // scan events
//     noble.on('scanStart', ()                => { /* console.log("scanStart"); */  });
//     noble.on('scanStop',  ()                => { /* console.log("scanStop");  */  });
//     noble.on('discover',  (advertisement)   => { this.discover(advertisement);    });
//     noble.on('warning',   (warning)         => { console.log("warning", warning); });
//   }
//
//
//   isReady() {
//     return new Promise((resolve, reject) => {
//       if (this.nobleState === 'poweredOn') {
//         resolve()
//       }
//       else {
//         let interval = setInterval(() => {
//           if (this.nobleState === 'poweredOn') {
//             clearInterval(interval);
//             resolve()
//           }
//           else if (this.nobleState !== 'unknown') {
//             clearInterval(interval);
//             reject("Noble State (BLE-handling-lib) is not usable: " + this.nobleState);
//           }
//         }, 500);
//       }
//     })
//   }
//
//
//   start() {
//     return this.isReady()
//       .then(() => {
//         if (this.scanningInProgress !== true) {
//           this.scanningInProgress = true;
//           noble.startScanning(
//             [CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID, CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID, CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID],
//             true
//           );
//         }
//       })
//   }
//
//
//   stop() {
//     if (this.scanningInProgress) {
//       noble.stopScanning();
//       this.scanningInProgress = false;
//     }
//   }
//
//   cleanUp() {
//     noble.removeAllListeners();
//   }
//
//
//   /**
//    * Check if this uuid is in the cache. If it is not, we will scan for 3 seconds to find it!
//    * @param identifier
//    * @returns {Promise<any>}
//    */
//   getPeripheral(identifier, scanDuration = 15000) {
//     return new Promise((resolve, reject) => {
//       if (this.cache[identifier] === undefined) {
//         let timeout = null;
//         console.log("Peripheral not cached. Starting scan...");
//         this.start()
//           .then(() => {
//             console.log("Scan started...");
//             let unsubscribe = eventBus.on(Topics.peripheralDiscovered, (peripheral) => {
//               // found a match!
//               if ( peripheral.uuid === identifier || peripheral.address === identifier ) {
//                 // success! stop the timeout.
//                 clearTimeout(timeout);
//
//                 // unsub from this event
//                 unsubscribe();
//
//                 // here it is!
//                 noble.once('scanStop',  () => { setTimeout(() => { resolve(peripheral); },500);});
//
//                 // stop scanning
//                 this.stop();
//               }
//             });
//
//             // scan for 3 seconds for this uuid, then stop and fail.
//             timeout = setTimeout(() => { unsubscribe(); reject(null); this.stop();}, scanDuration);
//           })
//       }
//       else {
//         resolve(this.cache[identifier].peripheral);
//       }
//     })
//       .catch((err) => {
//         console.log("Could not find Peripheral.")
//         throw err;
//       })
//   }
//
//
//   /**
//    * This can be either an iBeacon payload, a scanresponse or both combined.
//    * @type {Advertisement}
//    */
//   discover(peripheral) {
//     eventBus.emit(Topics.peripheralDiscovered, peripheral);
//
//     let advertisement = new Advertisement(peripheral, this.settings.referenceId)
//
//     if ( !advertisement.serviceDataAvailable ) { return }
//
//     // decrypt the advertisement
//     if (this.settings.encryptionEnabled) {
//       advertisement.decrypt(this.settings.guestKey);
//     }
//     else {
//       advertisement.setReadyForUse();
//     }
//     // parse the service data
//     advertisement.process();
//
//     this.cache[peripheral.uuid]    = { advertisement: advertisement, peripheral: peripheral };
//     this.cache[peripheral.address] = { advertisement: advertisement, peripheral: peripheral };
//
//     if (this.trackedStones[advertisement.id] === undefined) {
//       this.trackedStones[advertisement.id] = new StoneTracker();
//     }
//
//     this.trackedStones[advertisement.id].update(advertisement);
//
//     eventBus.emit(Topics.advertisement, advertisement.getJSON())
//     if (this.trackedStones[advertisement.id].verified) {
//       eventBus.emit(Topics.verifiedAdvertisement, advertisement.getJSON())
//     }
//   }
//
//
// }
//# sourceMappingURL=Scanner.js.map