"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devices = {
    getDevices: function (background) {
        return this._setupRequest('GET', '/users/{id}/devices', { background: background, data: { filter: { "include": "installations" } } });
    },
    createDevice: function (data, background = true) {
        return this._setupRequest('POST', '/users/{id}/devices', { data: data, background: background }, 'body');
    },
    updateDevice: function (deviceId, data, background = true) {
        return this._setupRequest('PUT', '/Devices/' + deviceId, { data: data, background: background }, 'body');
    },
    updateDeviceLocation: function (cloudLocationId, background = true) {
        return this._setupRequest('PUT', '/Devices/{id}/currentLocation/' + cloudLocationId, { background: background });
    },
    updateDeviceSphere: function (cloudSphereId, background = true) {
        return this._setupRequest('PUT', '/Devices/{id}/currentSphere/' + cloudSphereId, { background: background });
    },
    deleteDevice: function (deviceId) {
        return this._setupRequest('DELETE', '/users/{id}/devices/' + deviceId);
    },
    deleteAllDevices: function () {
        return this._setupRequest('DELETE', '/users/{id}/deleteAllDevices');
    }
};
//# sourceMappingURL=devices.js.map