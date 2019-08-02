"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EncryptionHandler_1 = require("../util/EncryptionHandler");
const NotificationMerger_1 = require("../util/NotificationMerger");
const BluenetTypes_1 = require("../protocol/BluenetTypes");
const BluenetError_1 = require("../BluenetError");
const Util_1 = require("../util/Util");
class BleHandler {
    constructor(settings) {
        this.connectedPeripheral = null;
        this.connectionSessionId = null;
        this.connectionPending = false;
        this.settings = settings;
    }
    
    setApp(app) {
        this.app = app;
        this.app.log("Set reference to Homey app in BLE handler");
    }

    /**
     * Connect is either a handle or a peripheral object
     * @param connectData
     */
    async connect(connectData) {

        try {

            this.app.log('Connect');
            const peripheral = await connectData.connect();
            
            this._setConnectedPeripheral(peripheral);

            this.app.log('Discover services');
            const services = await peripheral.discoverServices();
                
            services.forEach((service) => {
                this.connectedPeripheral.services[service.uuid] = service;
            });

            for (const service of services) {
                const characteristics = await service.discoverCharacteristics();
                
                characteristics.forEach((characteristic) => {
                    if (this.connectedPeripheral.characteristics[service.uuid] === undefined) {
                        this.connectedPeripheral.characteristics[service.uuid] = {};
                    }
                    this.connectedPeripheral.characteristics[service.uuid][characteristic.uuid] = characteristic;
                });
            }

            return this.connectedPeripheral;
        
        } 
        catch (error) {
            this.app.log("Error: ", error);
            await this.disconnect();
            throw error;
        }

        /*
        return this._connect(connectData)
            .then((peripheral) => {
            this.app.log("BleHandler: Getting Services...");
            return this._getServices(peripheral);
        })
            .then((services) => {
            this.app.log("BleHandler: Getting Characteristics...");
            return this._getCharacteristics(services);
        })
            .then(() => {
            this.app.log("BleHandler: Connection process complete.");
        })
            .catch((err) => { this.app.log(err); throw err; });
        */
    }
    _connect(peripheral) {
        if (this.connectedPeripheral !== null) {
            if (peripheral.uuid === this.connectedPeripheral.peripheral.uuid) {
                return new Promise((resolve, reject) => { resolve(peripheral); });
            }
            throw new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.ALREADY_CONNECTED_TO_SOMETHING_ELSE, "Bluenet is already connected to another Crownstone.");
        }
        // connecting run
        return new Promise((resolve, reject) => {
            this.app.log("_connect");
            // if this has the connect method implemented....
            if (this.connectionPending === true) {
                reject(new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.ALREADY_CONNECTING_TO_SOMETHING_ELSE, "We're already trying to connect to something else. Aborting connection request."));
            }
            else {
                this.app.log("Peripheral", peripheral);
                if (peripheral.connect) {
                    this.connectionPending = true;
                    this.app.log("BleHandler: Call now peripheral.connect");

                    // this function never returns
                    peripheral.connect((err, homeyPeripheral) => {
                        if (err) {
                            this.app.log("BleHandler: No connection made!");
                            this.connectionPending = false;
                            reject(err);
                        }
                        else {
                            this.app.log("BleHandler: Connected successfully!");
                            this.connectionPending = false;
                            this._setConnectedPeripheral(homeyPeripheral);
                            resolve(homeyPeripheral);
                        }
                    });
                }
                else {
                    this.app.log("No connect field");
                    reject(new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.INVALID_PERIPHERAL, "Invalid peripheral to connect to."));
                }
            }
        });
    }
    _getServices(peripheral) {
        return new Promise((resolve, reject) => {
            peripheral.discoverServices([], (err, services) => {
                if (err) {
                    return reject(err);
                }
                ;
                services.forEach((service) => {
                    this.connectedPeripheral.services[service.uuid] = service;
                });
                resolve(services);
            });
        });
    }
    _getCharacteristics(services) {
        return new Promise((resolve, reject) => {
            let promises = [];
            services.forEach((service) => {
                promises.push(this._getCharacteristicsFromService(service));
            });
            Promise.all(promises)
                .then(() => {
                resolve();
            })
                .catch((err) => { reject(err); });
        });
    }
    _getCharacteristicsFromService(service) {
        return new Promise((resolve, reject) => {
            service.discoverCharacteristics([], (err, characteristics) => {
                if (err) {
                    return reject(err);
                }
                ;
                characteristics.forEach((characteristic) => {
                    if (this.connectedPeripheral.characteristics[service.uuid] === undefined) {
                        this.connectedPeripheral.characteristics[service.uuid] = {};
                    }
                    this.connectedPeripheral.characteristics[service.uuid][characteristic.uuid] = characteristic;
                });
                resolve(characteristics);
            });
        });
    }
    _setConnectedPeripheral(peripheral) {
        peripheral.once("disconnect", () => {
            this.app.log("BleHandler: Disconnected from Device, cleaning up...");
            this.connectedPeripheral = null;
        });
        this.connectionSessionId = Util_1.Util.getUUID();
        this.connectedPeripheral = { peripheral: peripheral, services: {}, characteristics: {} };
    }


    disconnect() {
        this.app.log("BleHandler: starting disconnect.....");
            
        if (this.connectedPeripheral !== null) {
            this.app.log("BleHandler: Disconnecting from peripheral.....");
            
            return this.connectedPeripheral.peripheral.disconnect()
                .then(() => {
                    this.app.log("BleHandler: Disconnected successfully.");
                    this.connectionPending = false;
                    this.connectedPeripheral = null;
                })
                .catch((err) => {
                    this.app.log("BleHandler: Disconnecting failed...");
                })
        }

        /*
        return new Promise((resolve, reject) => {
            if (this.connectedPeripheral !== null) {
                this.app.log("BleHandler: Disconnecting from peripheral.....");
                this.connectedPeripheral.peripheral.disconnect((err) => {
                    if (err) {
                        this.app.log("BleHandler: Disconnecting Failed...");
                        return reject(err);
                    }
                    this.app.log("BleHandler: Disconnected successfully.");
                    this.connectionPending = false;
                    this.connectedPeripheral = null;
                    resolve();
                });
            }
            else {
                this.app.log("BleHandler: Not connected in the first place. Success!");
                resolve();
            }
        });
        */
    }
    waitForPeripheralToDisconnect(timeoutInSeconds) {
        return new Promise((resolve, reject) => {
            if (this.connectedPeripheral) {
                let timeoutPassed = false;
                let timeout = setTimeout(() => { timeoutPassed = true; reject(); }, timeoutInSeconds * 1000);
                this.connectedPeripheral.peripheral.once("disconnect", () => {
                    if (timeoutPassed === false) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
    errorDisconnect() {
        return this.disconnect()
            .catch((err) => { });
    }

    /**
     * This does not return properly...
     */
    writeToCharacteristic(serviceId, characteristicId, data, encryptionEnabled = true) {
//        return new Promise((resolve, reject) => {
        
            let dataToUse = data;
            if (encryptionEnabled) {
                this.app.log("Encrypt data");
                dataToUse = EncryptionHandler_1.EncryptionHandler.encrypt(data, this.settings);
            }

            return this.getCharacteristic(serviceId, characteristicId)
                .then((characteristic) => {
                    this.app.log("Write data");
                    return characteristic.write(dataToUse);
                })
                .catch((err) => { 
                    this.app.log("Write error", err); 
                })
        /*
            this.getCharacteristic(serviceId, characteristicId)
                .then((characteristic) => {
                    this.app.log("Write data");
                    characteristic.write(dataToUse, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                })
                */
    //            .catch((err) => { reject(err); });
  //      });
    }
    readCharacteristic(serviceId, characteristicId, encryptionEnabled = true) {
        this.app.log("Read characteristic", characteristicId);
            
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                this.app.log("Read data");
                return characteristic.read();
            })
            .catch((err) => { 
                this.app.log("Read error", err); 
            })
    }


    readCharacteristicWithoutEncryption(serviceId, characteristicId) {
        return this.readCharacteristic(serviceId, characteristicId, false);
    }

    getService(serviceId) {
        return new Promise((resolve, reject) => {
            if (!this.connectedPeripheral) {
                return reject("NOT CONNECTED");
            }
            let service = this.connectedPeripheral.services[serviceId];
            if (!service) {
                return reject("Service Unknown:" + serviceId + " in list:" + JSON.stringify(Object.keys(this.connectedPeripheral.services)));
            }
            resolve(service);
        });
    }
    getCharacteristic(serviceId, characteristicId) {
        return new Promise((resolve, reject) => {
            if (!this.connectedPeripheral) {
                return reject("NOT CONNECTED");
            }
            let serviceList = this.connectedPeripheral.characteristics[serviceId];
            if (!serviceList) {
                return reject("Service Unknown:" + serviceId + " in list:" + JSON.stringify(Object.keys(this.connectedPeripheral.characteristics)));
            }
            let characteristic = serviceList[characteristicId];
            if (!characteristic) {
                return reject("Characteristic Unknown:" + characteristicId + " in list:" + JSON.stringify(Object.keys(serviceList)));
            }
            resolve(characteristic);
        });
    }
    setupSingleNotification(serviceId, characteristicId, writeCommand) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
            return new Promise((resolve, reject) => {
                let cleanUp = (err) => {
                    // cleanup listeners
                    characteristic.removeListener('data', collectDataCallback);
                    if (err) {
                        return reject(err);
                    }
                };
                let mergedDataCallback = (data) => {
                    cleanUp(null);
                    // first we check if we have to decrypt this data.
                    if (this.settings.encryptionEnabled) {
                        data = EncryptionHandler_1.EncryptionHandler.decrypt(data, this.settings);
                    }
                    resolve(data);
                };
                let merger = new NotificationMerger_1.NotificationMerger(mergedDataCallback);
                let collectDataCallback = (data, isNotification) => {
                    if (isNotification) {
                        merger.merge(data);
                    }
                };
                characteristic.on('data', collectDataCallback);
                characteristic.once('notify', (state) => {
                    if (state === true) {
                        // great!
                        writeCommand();
                    }
                    else {
                        cleanUp("Failed to subscribe to notifications");
                    }
                });
                characteristic.subscribe((err) => { if (err) {
                    return cleanUp(err);
                } });
            });
        });
    }
    setupNotificationStream(serviceId, characteristicId, writeCommand, processHandler, timeout = 5) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
            return new Promise((resolve, reject) => {
                let fallbackTimeout = setTimeout(() => { cleanUp("Notification Stream Timeout"); }, timeout * 1000);
                let cleanUp = (err) => {
                    // cleanup listeners
                    clearTimeout(fallbackTimeout);
                    characteristic.removeListener('data', collectDataCallback);
                    characteristic.unsubscribe();
                    if (err) {
                        return reject(err);
                    }
                };
                let mergedDataCallback = (data) => {
                    // first we check if we have to decrypt this data.
                    if (this.settings.encryptionEnabled) {
                        data = EncryptionHandler_1.EncryptionHandler.decrypt(data, this.settings);
                    }
                    let instruction = processHandler(data);
                    if (instruction === BluenetTypes_1.ProcessType.ABORT_ERROR) {
                        cleanUp("Abort");
                    }
                    else if (instruction === BluenetTypes_1.ProcessType.CONTINUE) {
                        // do nothing and wait
                    }
                    else if (instruction === BluenetTypes_1.ProcessType.FINISHED) {
                        cleanUp(null);
                        return resolve();
                    }
                    else {
                        cleanUp("Unknown instruction");
                    }
                };
                let merger = new NotificationMerger_1.NotificationMerger(mergedDataCallback);
                let collectDataCallback = (data, isNotification) => {
                    this.app.log("Got Data", data, isNotification);
                    if (isNotification) {
                        merger.merge(data);
                    }
                };
                characteristic.on('data', collectDataCallback);
                characteristic.once('notify', (state) => {
                    if (state === true) {
                        // great!
                        writeCommand();
                    }
                    else {
                        cleanUp("Failed to subscribe to notifications");
                    }
                });
                characteristic.subscribe((err) => { if (err) {
                    return cleanUp(err);
                } });
            });
        });
    }
}
exports.BleHandler = BleHandler;
//# sourceMappingURL=BleHandler.js.map
