"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLevel = {
    admin: 0,
    member: 1,
    guest: 2,
    setup: 100,
    unknown: 255,
};
class BluenetSettings {
    constructor() {
        this.encryptionEnabled = true;
        this.adminKey = null;
        this.memberKey = null;
        this.guestKey = null;
        this.setupKey = null;
        this.referenceId = null;
        this.sessionNonce = null;
        this.initializedKeys = false;
        this.temporaryDisable = false;
        this.userLevel = exports.UserLevel.unknown;
    }
    loadKeys(encryptionEnabled, adminKey = null, memberKey = null, guestKey = null, referenceId) {
        this.encryptionEnabled = encryptionEnabled;
        this.adminKey = this._prepKey(adminKey);
        this.memberKey = this._prepKey(memberKey);
        this.guestKey = this._prepKey(guestKey);
        this.referenceId = referenceId;
        this.initializedKeys = true;
        this.determineUserLevel();
    }
    _prepKey(key) {
        if (!key) {
            return Buffer.alloc(16);
        }
        if (key.length === 16) {
            return Buffer.from(key, 'ascii');
        }
        else if (key.length === 32) {
            return Buffer.from(key, 'hex');
        }
        else {
            throw "Invalid Key: " + key;
        }
    }
    determineUserLevel() {
        if (this.adminKey.length == 16) {
            this.userLevel = exports.UserLevel.admin;
        }
        else if (this.memberKey.length == 16) {
            this.userLevel = exports.UserLevel.member;
        }
        else if (this.guestKey.length == 16) {
            this.userLevel = exports.UserLevel.guest;
        }
        else {
            this.userLevel = exports.UserLevel.unknown;
            this.initializedKeys = false;
        }
    }
    invalidateSessionNonce() {
        this.sessionNonce = null;
    }
    setSessionNonce(sessionNonce) {
        this.sessionNonce = sessionNonce;
    }
    loadSetupKey(setupKey) {
        this.setupKey = setupKey;
        this.userLevel = exports.UserLevel.setup;
    }
    exitSetup() {
        this.setupKey = null;
        this.determineUserLevel();
    }
    disableEncryptionTemporarily() {
        this.temporaryDisable = true;
    }
    restoreEncryption() {
        this.temporaryDisable = false;
    }
    isTemporarilyDisabled() {
        return this.temporaryDisable;
    }
    isEncryptionEnabled() {
        if (this.temporaryDisable) {
            return false;
        }
        return this.encryptionEnabled;
    }
}
exports.BluenetSettings = BluenetSettings;
//# sourceMappingURL=BluenetSettings.js.map