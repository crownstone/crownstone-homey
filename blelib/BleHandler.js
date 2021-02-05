'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const EncryptionHandler = require('./EncryptionHandler');
const Util = require('./Util');
class BleHandler {
    constructor(settings) {
        this.connectedPeripheral = null;
        this.connectionSessionId = null;
        this.settings = settings;
    }

    /**
     * This method will connect the Homey to the peripheral and discover all of it's services and
     * characteristics.
     */
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

    /**
     * This method will set up the peripheral instance and will generate a random session ID.
     */
    _setConnectedPeripheral(peripheral) {
        peripheral.once('disconnect', () => {
            console.log('Disconnected from device');
            this.connectedPeripheral = null;
        });
        this.connectionSessionId = Util.Util.getVersion4UUID();
        this.connectedPeripheral = { peripheral: peripheral, services: {}, characteristics: {} };
    }

    /**
     * This method will disconnect the Homey from the peripheral and reset the variables.
     */
    disconnect() {
        if (this.connectedPeripheral !== null) {
            return this.connectedPeripheral.peripheral.disconnect()
                .then(() => {
                    this.connectedPeripheral = null;
                })
                .catch((e) => {
                    console.log('There was a problem disconnecting from the peripheral:', e);
                });
        }
    }

    /**
     * This method will read the characteristic for given serviceUuid and characteristicUuid.
     */
    readCharacteristic(serviceId, characteristicId) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                return characteristic.read();
            })
            .catch((e) => {
                console.log('There was a problem reading the characteristics:', e);
            });
    }

    /**
     * This method will get the characteristic for given serviceUuid and characteristicUuid.
     */
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

    /**
     * This method will write the buffer data to the characteristic for given serviceUuid and
     * characteristicUuid.
     */
    writeToCharacteristic(serviceId, characteristicId, packet) {
        let dataToUse = EncryptionHandler.EncryptionHandler.encrypt(packet, this.settings);
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                return characteristic.write(dataToUse);
            })
            .catch((e) => {
                console.log('There was a problem writing to characteristic:', e);
            });
    }
}
exports.BleHandler = BleHandler;
