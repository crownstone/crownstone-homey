// todo: add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
const EncryptionHandler = require('./EncryptionHandler');
const Util = require('./Util');
class BleHandler {
    constructor(settings) {
        this.connectedPeripheral = null;
        this.connectionSessionId = null;
        this.settings = settings;
    }

    async connect(connectData) {
        try {
            const peripheral = await connectData.connect();
            this._setConnectedPeripheral(peripheral);
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
        catch(e) {
            console.log('There was a problem making a connection to the device:', e);
            await this.disconnect();
            throw e;
        }
    }

    _setConnectedPeripheral(peripheral) {
        peripheral.once('disconnect', () => {
            console.log('Disconnected from device');
            this.connectedPeripheral = null;
        });
        this.connectionSessionId = Util.Util.getVersion4UUID();
        this.connectedPeripheral = { peripheral: peripheral, services: {}, characteristics: {} };
    }

    disconnect() {
        console.log('Disconnecting..');
        if (this.connectedPeripheral !== null) {
            console.log('Disconnecting from peripheral..');
            return this.connectedPeripheral.peripheral.disconnect()
                .then(() => {
                    console.log('Disconnected successfully');
                    //this.connectionPending = false;
                    this.connectedPeripheral = null;
                })
                .catch((e) => {
                    console.log('There was a problem disconnecting:', e);
                });
        }
    }

    readCharacteristic(serviceId, characteristicId) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                return characteristic.read();
            })
            .catch((e) => {
                console.log('There was a problem reading the characteristics:', e);
            });
    }

    getCharacteristic(serviceId, characteristicId) {
        return new Promise((resolve, reject) => {
            if (!this.connectedPeripheral) {
                return reject('NOT CONNECTED');
            }
            let serviceList = this.connectedPeripheral.characteristics[serviceId];
            if (!serviceList) {
                return reject('Service Unknown: ' + serviceId + ' in list:' + JSON.stringify(Object.keys(this.connectedPeripheral.characteristics)));
            }
            let characteristic = serviceList[characteristicId];
            if (!characteristic) {
                return reject('Characteristic Unknown: ' + characteristicId + ' in list:' + JSON.stringify(Object.keys(serviceList)));
            }
            resolve(characteristic);
        });
    }

    writeToCharacteristic(serviceId, characteristicId, packet) {
        let dataToUse = EncryptionHandler.EncryptionHandler.encrypt(packet, this.settings);
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                return characteristic.write(dataToUse);
            })
            .catch((err) => {
                console.log('Write error: ', err);
            });
    }
}
exports.BleHandler = BleHandler;
