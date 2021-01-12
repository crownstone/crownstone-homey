'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Util = {
    boundToUnity: function (value) {
        return Math.min(1, Math.max(value, 0));
    },
    bound0_100: function (value) {
        return exports.Util.boundToUnity(value) * 100;
    },

    /**
     * This function will return a Version 4 UUID as a string.
     * The unique UUID is obtained using random numbers.
     */
    getVersion4UUID: () => {
        const S4 = function () {
            return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
        };
        return (S4() + S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + S4() + S4());
    },
};