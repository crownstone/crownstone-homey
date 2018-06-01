"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("./cloudAPI");
const sha1 = require('sha-1');
class CloudHandler {
    constructor() {
        this.token = null;
        this.userId = null;
    }
    login(userData) {
        return this._login(userData)
            .then((result) => {
            cloudAPI_1.CLOUD.setAccess(result.id);
            cloudAPI_1.CLOUD.setUserId(result.userId);
            this.token = result.id;
            this.userId = result.userId;
        });
    }
    getKeys(sphereId) {
        return cloudAPI_1.CLOUD.forUser(this.userId).getKeys()
            .then((results) => {
            if (sphereId) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i].sphereId === sphereId) {
                        return results[i].keys;
                    }
                }
                throw ("Unknown SphereId Provided");
            }
            else {
                throw ("No SphereId Provided");
            }
        });
    }
    _login(userData) {
        return new Promise((resolve, reject) => {
            if (userData.email && userData.password) {
                let password = sha1(userData.password);
                resolve(cloudAPI_1.CLOUD.login({
                    email: userData.email,
                    password: password,
                    onUnverified: () => { reject("User has not validated their email yet."); },
                    onInvalidCredentials: () => { reject("Invalid Credentials"); }
                }));
            }
            else if (userData.email && userData.sha1Password) {
                resolve(cloudAPI_1.CLOUD.login({
                    email: userData.email,
                    password: userData.sha1Password,
                    onUnverified: () => { reject("User has not validated their email yet."); },
                    onInvalidCredentials: () => { reject("Invalid Credentials"); }
                }));
            }
            else if (userData.userId && userData.token) {
                resolve({ userId: userData.userId, id: userData.token });
            }
            else if (userData.token) {
                cloudAPI_1.CLOUD.setAccess(userData.token);
                resolve(cloudAPI_1.CLOUD.getUserId().then((result) => { return { userId: result, id: userData.token }; }));
            }
            else {
                reject("Invalid user data.");
            }
        });
    }
}
exports.CloudHandler = CloudHandler;
//# sourceMappingURL=CloudHandler.js.map