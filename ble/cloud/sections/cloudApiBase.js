"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudCore_1 = require("../cloudCore");
const Log_1 = require("../../util/logging/Log");
exports.defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
exports.uploadHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
};
/**
 * The cloud API is designed to maintain the REST endpoints and to handle responses and errors on the network level.
 * When the responses come back successfully, the convenience wrappers allow callbacks for relevant scenarios.
 */
exports.cloudApiBase = {
    _accessToken: undefined,
    _userId: undefined,
    _deviceId: undefined,
    _installationId: undefined,
    _eventId: undefined,
    _sphereId: undefined,
    _locationId: undefined,
    _stoneId: undefined,
    _applianceId: undefined,
    _messageId: undefined,
    _networkErrorHandler: () => { },
    _post: function (options) {
        return cloudCore_1.request(options, 'POST', exports.defaultHeaders, _getId(options.endPoint, this), this._accessToken);
    },
    _get: function (options) {
        return cloudCore_1.request(options, 'GET', exports.defaultHeaders, _getId(options.endPoint, this), this._accessToken);
    },
    _delete: function (options) {
        return cloudCore_1.request(options, 'DELETE', exports.defaultHeaders, _getId(options.endPoint, this), this._accessToken);
    },
    _put: function (options) {
        return cloudCore_1.request(options, 'PUT', exports.defaultHeaders, _getId(options.endPoint, this), this._accessToken);
    },
    _head: function (options) {
        return cloudCore_1.request(options, 'HEAD', exports.defaultHeaders, _getId(options.endPoint, this), this._accessToken);
    },
    _handleNetworkError: function (error, options, endpoint, promiseBody, reject) {
        if (options.background !== true) {
            this._networkErrorHandler(error);
            reject(error);
        }
        else {
            // still reject the promise even if it is a background operation.
            reject(error);
        }
    },
    /**
     * This method will check the return type error code for 200 or 204 and unpack the data from the response.
     * @param {string} reqType
     * @param {string} endpoint
     * @param {requestOptions} options
     * @param {requestType} type
     * @returns {Promise<any>}
     * @private
     */
    _setupRequest: function (reqType, endpoint, options = {}, type = 'query') {
        let promiseBody = { endPoint: endpoint, data: options.data, type: type, options: options };
        let promise;
        switch (reqType) {
            case 'POST':
                promise = this._post(promiseBody);
                break;
            case 'GET':
                promise = this._get(promiseBody);
                break;
            case 'PUT':
                promise = this._put(promiseBody);
                break;
            case 'DELETE':
                promise = this._delete(promiseBody);
                break;
            case 'HEAD':
                promise = this._head(promiseBody);
                break;
            default:
                Log_1.LOG.error("UNKNOWN TYPE:", reqType);
                return;
        }
        return this._finalizeRequest(promise, options, endpoint, promiseBody);
    },
    _finalizeRequest: function (promise, options, endpoint, promiseBody) {
        return new Promise((resolve, reject) => {
            promise
                .then((reply) => {
                if (reply.status === 200 || reply.status === 204)
                    resolve(reply.data);
                else
                    reject(reply);
            })
                .catch((error) => {
                //console.trace(error, this);
                this._handleNetworkError(error, options, endpoint, promiseBody, reject);
            });
        });
    },
    // END USER API
    // These methods have all the endpoints embedded in them.
    setNetworkErrorHandler: function (handler) { this._networkErrorHandler = handler; },
    setAccess: function (accessToken) { this._accessToken = accessToken; return this; },
    setUserId: function (userId) { this._userId = userId; return this; },
    forUser: function (userId) { this._userId = userId; return this; },
    forDevice: function (deviceId) { this._deviceId = deviceId; return this; },
    forInstallation: function (installationId) { this._installationId = installationId; return this; },
    forStone: function (cloudStoneId) { this._stoneId = cloudStoneId; return this; },
    forSphere: function (cloudSphereId) { this._sphereId = cloudSphereId; return this; },
    forLocation: function (cloudLocationId) { this._locationId = cloudLocationId; return this; },
    forAppliance: function (cloudApplianceId) { this._applianceId = cloudApplianceId; return this; },
    forMessage: function (cloudMessageId) { this._messageId = cloudMessageId; return this; },
};
function _getId(url, obj) {
    let usersLocation = url.indexOf('users');
    if (usersLocation !== -1 && usersLocation < 3)
        return obj._userId;
    let devicesLocation = url.indexOf('Devices');
    if (devicesLocation !== -1 && devicesLocation < 3)
        return obj._deviceId;
    let appliancesLocation = url.indexOf('Appliances');
    if (appliancesLocation !== -1 && appliancesLocation < 3)
        return obj._applianceId;
    let eventsLocation = url.indexOf('Events');
    if (eventsLocation !== -1 && eventsLocation < 3)
        return obj._eventId;
    let spheresLocation = url.indexOf('Spheres');
    if (spheresLocation !== -1 && spheresLocation < 3)
        return obj._sphereId;
    let locationsLocation = url.indexOf('Locations');
    if (locationsLocation !== -1 && locationsLocation < 3)
        return obj._locationId;
    let stoneLocation = url.indexOf('Stones');
    if (stoneLocation !== -1 && stoneLocation < 3)
        return obj._stoneId;
    let installationLocation = url.indexOf('AppInstallation');
    if (installationLocation !== -1 && installationLocation < 3)
        return obj._installationId;
    let messagesLocation = url.indexOf('Messages');
    if (messagesLocation !== -1 && messagesLocation < 3)
        return obj._messageId;
}
//# sourceMappingURL=cloudApiBase.js.map