"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailChecker = function (email) {
    let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
};
exports.characterChecker = function (value) {
    let reg = /[\D]/g;
    return reg.test(value);
};
exports.numberChecker = function (value) {
    let reg = /[0-9]/g;
    return reg.test(value);
};
exports.Util = {
    boundToUnity: function (value) {
        return Math.min(1, Math.max(value, 0));
    },
    bound0_100: function (value) {
        return exports.Util.boundToUnity(value) * 100;
    },
    getBitMaskUInt8: function (value) {
        var result = Array(8).fill(false);
        let one = 1;
        result[0] = (value & one) != 0;
        result[1] = (value & (one << 1)) != 0;
        result[2] = (value & (one << 2)) != 0;
        result[3] = (value & (one << 3)) != 0;
        result[4] = (value & (one << 4)) != 0;
        result[5] = (value & (one << 5)) != 0;
        result[6] = (value & (one << 6)) != 0;
        result[7] = (value & (one << 7)) != 0;
        return result;
    },
    getBitMaskUInt32: function (value) {
        var result = Array(32).fill(false);
        let one = 1;
        for (let i = 0; i < 32; i++) {
            result[i] = (value & (one << i)) != 0;
        }
        return result;
    },
    UInt32FromBitmask: function (bitMask) {
        let result = 0;
        let one = 1;
        for (let i = 0; i < 32; i++) {
            if (bitMask[i]) {
                result = (result | (one << i));
            }
        }
        return result;
    },
    getUUID: () => {
        const S4 = function () {
            return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
        };
        return (S4() + S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + S4() + S4());
    },
    getToken: () => {
        return Math.floor(Math.random() * 1e8).toString(36);
    },
    mixin: function (base, section) {
        for (let key in section) {
            if (section.hasOwnProperty(key))
                base[key] = section[key];
        }
    },
    versions: {
        isHigher: function (version, compareWithVersion) {
            if (!version || !compareWithVersion) {
                return false;
            }
            let [versionClean, versionRc] = getRC(version);
            let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);
            if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
                return false;
            }
            let A = versionClean.split('.');
            let B = compareWithVersionClean.split('.');
            if (A[0] < B[0])
                return false;
            else if (A[0] > B[0])
                return true;
            else {
                if (A[1] < B[1])
                    return false;
                else if (A[1] > B[1])
                    return true;
                else {
                    if (A[2] < B[2])
                        return false;
                    else if (A[2] > B[2])
                        return true;
                    else {
                        if (versionRc === null && compareWithVersionRc === null) {
                            return false;
                        }
                        else if (versionRc !== null && compareWithVersionRc !== null) {
                            return (versionRc > compareWithVersionRc);
                        }
                        else if (versionRc !== null) {
                            // 2.0.0.rc0 is smaller than 2.0.0
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
            }
        },
        /**
         * This is the same as the isHigherOrEqual except it allows access to githashes. It is up to the dev to determine what it can and cannot do.
         * @param myVersion
         * @param minimumRequiredVersion
         * @returns {any}
         */
        canIUse: function (myVersion, minimumRequiredVersion) {
            if (!myVersion) {
                return false;
            }
            if (!minimumRequiredVersion) {
                return false;
            }
            let [myVersionClean, myVersionRc] = getRC(myVersion);
            let [minimumRequiredVersionClean, minimumRequiredVersionRc] = getRC(minimumRequiredVersion);
            if (checkSemVer(myVersionClean) === false) {
                return true;
            }
            return exports.Util.versions.isHigherOrEqual(myVersionClean, minimumRequiredVersionClean);
        },
        isHigherOrEqual: function (version, compareWithVersion) {
            if (!version || !compareWithVersion) {
                return false;
            }
            let [versionClean, versionRc] = getRC(version);
            let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);
            if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
                return false;
            }
            if (version === compareWithVersion && version && compareWithVersion) {
                return true;
            }
            return exports.Util.versions.isHigher(version, compareWithVersion);
        },
        isLower: function (version, compareWithVersion) {
            if (!version || !compareWithVersion) {
                return false;
            }
            let [versionClean, versionRc] = getRC(version);
            let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);
            if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
                return false;
            }
            // Do not allow compareWithVersion to be semver
            if (compareWithVersion.split(".").length !== 3) {
                return false;
            }
            // if version is NOT semver, is higher will be false so is lower is true.
            return !exports.Util.versions.isHigherOrEqual(version, compareWithVersion);
        },
    },
    deepExtend: function (a, b, protoExtend = false, allowDeletion = false) {
        for (let prop in b) {
            if (b.hasOwnProperty(prop) || protoExtend === true) {
                if (b[prop] && b[prop].constructor === Object) {
                    if (a[prop] === undefined) {
                        a[prop] = {};
                    }
                    if (a[prop].constructor === Object) {
                        exports.Util.deepExtend(a[prop], b[prop], protoExtend);
                    }
                    else {
                        if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
                            delete a[prop];
                        }
                        else {
                            a[prop] = b[prop];
                        }
                    }
                }
                else if (Array.isArray(b[prop])) {
                    a[prop] = [];
                    for (let i = 0; i < b[prop].length; i++) {
                        a[prop].push(b[prop][i]);
                    }
                }
                else {
                    if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
                        delete a[prop];
                    }
                    else {
                        a[prop] = b[prop];
                    }
                }
            }
        }
        return a;
    },
    promiseBatchPerformer: function (arr, method) {
        if (arr.length === 0) {
            return new Promise((resolve, reject) => { resolve(); });
        }
        return exports.Util._promiseBatchPerformer(arr, 0, method);
    },
    _promiseBatchPerformer: function (arr, index, method) {
        return new Promise((resolve, reject) => {
            if (index < arr.length) {
                method(arr[index])
                    .then(() => {
                    return exports.Util._promiseBatchPerformer(arr, index + 1, method);
                })
                    .then(() => {
                    resolve();
                })
                    .catch((err) => reject(err));
            }
            else {
                resolve();
            }
        });
    },
};
function getRC(version) {
    let lowerCaseVersion = version.toLowerCase();
    let lowerCaseRC_split = lowerCaseVersion.split("-rc");
    let RC = null;
    if (lowerCaseRC_split.length > 1) {
        RC = lowerCaseRC_split[1];
    }
    return [lowerCaseRC_split[0], RC];
}
let checkSemVer = (str) => {
    if (!str) {
        return false;
    }
    // a git commit hash is longer than 12, we pick 12 so 123.122.1234 is the max semver length.
    if (str.length > 12) {
        return false;
    }
    let A = str.split('.');
    // further ensure only semver is compared
    if (A.length !== 3) {
        return false;
    }
    return true;
};
let pad = (base) => {
    if (Number(base) < 10) {
        return '0' + base;
    }
    return base;
};
//# sourceMappingURL=Util.js.map