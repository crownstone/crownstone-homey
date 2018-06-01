"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = {
    /**
     *
     * @param options
     * @returns {Promise}
     */
    registerUser: function (options) {
        return this._setupRequest('POST', 'users', { data: {
                email: options.email,
                password: options.password,
                firstName: options.firstName,
                lastName: options.lastName
            } }, 'body');
    },
    /**
     *
     * @param options
     * {
     *   email: string,
     *   password: string,
     *   onUnverified: callback,
     *   onInvalidCredentials: callback,
     *   background: boolean
     * }
     *
     * resolves with the parsed data, rejects with {status: httpStatus, data: data}
     */
    login: function (options) {
        return this._setupRequest('POST', 'users/login', {
            data: {
                email: options.email,
                password: options.password,
                ttl: 7 * 24 * 3600
            },
            noAccessToken: true
        }, 'body');
    },
    /**
     *
     * @returns {*}
     */
    getUserData: function (background = true) {
        return this._setupRequest('GET', '/users/{id}', { background });
    },
    /**
     *
     * @returns {*}
     */
    getUserId: function (background = true) {
        return this._setupRequest('GET', '/users/userId', { background });
    },
    /**
  
    /**
     *
     * @param data
     * @param background
     * @returns {Promise}
     */
    updateUserData: function (data, background = true) {
        return this._setupRequest('PUT', '/users/{id}', { data: data, background: background }, 'body');
    },
    /**
     *
     * @param options
     */
    requestVerificationEmail: function (options = {}) {
        return this._setupRequest('POST', 'users/resendVerification', { data: { email: options.email }, background: options.background }, 'query');
    },
    /**
     *
     * @param options
     */
    requestPasswordResetEmail: function (options = {}) {
        return this._setupRequest('POST', 'users/reset', { data: { email: options.email }, background: options.background }, 'body');
    },
    getKeys: function (background = true) {
        return this._setupRequest('GET', 'users/{id}/keys', { background: background });
    },
};
//# sourceMappingURL=user.js.map