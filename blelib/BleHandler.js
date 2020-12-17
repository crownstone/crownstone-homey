// todo: add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
class BleHandler {
    constructor(settings) {
        this.connectedPeripheral = null;
        this.connectionSessionId = null;
        //this.connectionPending = false;
        this.settings = settings;
    }

    async connect(connectData) {
        try {
            this.log('Connect');
            const peripheral = await connectData.connect();
            this._setConnectedPeripheral(peripheral);
            this.log('Discover services');
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
            this.log('There was a problem making a connection to the device:', e);
            await this.disconnect();
            throw e;
        }
    }

    _setConnectedPeripheral(peripheral) {
        peripheral.once('disconnect', () => {
            this.log('Disconnected from device');
            this.connectedPeripheral = null;
        });
        this.connectionSessionId = this.getVersion4UUID();
        this.connectedPeripheral = { peripheral: peripheral, services: {}, characteristics: {} };
    }

    disconnect() {
        this.log('Disconnecting..');
        if (this.connectedPeripheral !== null) {
            this.log('Disconnecting from peripheral..');
            return this.connectedPeripheral.peripheral.disconnect()
                .then(() => {
                    this.log('Disconnected successfully');
                    //this.connectionPending = false;
                    this.connectedPeripheral = null;
                })
                .catch((e) => {
                    this.log('There was a problem disconnecting:', e);
                });
        }
    }

    readCharacteristic(serviceId, characteristicId) {
        this.log('Read characteristic', characteristicId);
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
                this.log('Read data');
                return characteristic.read();
            })
            .catch((e) => {
                this.log('There was a problem reading the characteristics:', e);
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

    /**
     * This method will return a Version 4 UUID as a string.
     * The unique UUID is obtained using random numbers.
     */
    getVersion4UUID() {
        const S4 = function () {
            return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
        };
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    }
}
exports.BleHandler = BleHandler;
