// todo: add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
class BluenetSettings {
    constructor() {
        this.adminKey = null;
        this.memberKey = null;
        this.guestKey = null;
        this.sessionNonce = null;
    }

    /**
     * This method will set the admin, member and guest key to the values of the parameters.
     */
    loadKeys(adminKey = null, memberKey = null, guestKey = null) {
        this.adminKey = this._prepKey(adminKey);
        this.memberKey = this._prepKey(memberKey);
        this.guestKey = this._prepKey(guestKey);
    }

    /**
     * This method will return the buffer of the key depending on the length of the key.
     */
    _prepKey(key) {
        if (!key) {
            return Buffer.alloc(16);
        }
        if (key.length === 16) {
            return Buffer.from(key, 'ascii');
        } else if (key.length === 32) {
            return Buffer.from(key, 'hex');
        } else {
            throw 'Invalid Key: ' + key;
        }
    }

    /**
     * This method will set the sessionNonce to the value of the parameter.
     */
    setSessionNonce(sessionNonce) {
        this.sessionNonce = sessionNonce;
    }
}
exports.BluenetSettings = BluenetSettings;
