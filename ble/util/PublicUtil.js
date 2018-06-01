"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let crypto = require('crypto');
const ADVERTISING_ACCESS_ADDRESS = 0x8E89BED6;
exports.PublicUtil = {
    /** BLE specification's rules are defined in Core spec 4.2 Vol. 6 Part B Chapter 2.1.2 and are as follows:
    *	 The initiator shall ensure that the Access Address meets the following requirements:
    *	• It shall have no more than six consecutive zeros or ones.
    *	• It shall not be the advertising channel packets’ Access Address.
    *	• It shall not be a sequence that differs from the advertising channel packets’ Access Address by only one bit.
    *	• It shall not have all four octets equal.
    *	• It shall have no more than 24 transitions.
    *	• It shall have a minimum of two transitions in the most significant six bits.
    **/
    generateMeshAccessAddress: function (retries = 0) {
        let random = crypto.randomBytes(4);
        if (!validateAccessAddress(random.readUInt32BE())) {
            retries++;
            return exports.PublicUtil.generateMeshAccessAddress(retries);
        }
        else {
            return random.toString('hex');
        }
    },
};
function validateAccessAddress(address) {
    let advertisingAccessAddress = ADVERTISING_ACCESS_ADDRESS;
    // Requirement: It shall not be the advertising channel packets’ Access Address.
    if (address == advertisingAccessAddress) {
        return false;
    }
    else if (((address >>> 24) == ((address >>> 16) & 0xFF)) &&
        // Requirement: It shall not have all four octets equal.
        ((address >>> 24) == ((address >>> 8) & 0xFF)) &&
        ((address >>> 24) == (address & 0xFF))) {
        return false;
    }
    else {
        let last0 = 0;
        let last1 = 0;
        let diff = 0;
        let transition = -1;
        let lastBit = -1;
        for (let i = 0; i < 32; i++) {
            // debug('address: ' + address);
            let bit = address >>> 31;
            // debug('bit: ' + bit);
            // debug('  last0: ' + last0 + ' last1: ' + last1 + ' trans: ' + transition);
            if (bit != lastBit) {
                transition++;
            }
            if (bit) {
                last1++;
                last0 = 0;
            }
            else {
                last0++;
                last1 = 0;
            }
            if (bit != (advertisingAccessAddress >>> 31)) {
                diff++;
            }
            // Requirement: It shall have no more than six consecutive zeros or ones.
            if ((last1 >= 6) || (last0 >= 6)) {
                return false;
            }
            // Requirement: It shall have no more than 24 transitions.
            if (transition > 24) {
                return false;
            }
            // Requirement: It shall have a minimum of two transitions in the most significant six bits.
            if (i == 5 && transition < 2) {
                return false;
            }
            address <<= 1;
            advertisingAccessAddress <<= 1;
            lastBit = bit;
        }
        // Requirement: It shall not be a sequence that differs from the advertising channel packets’
        //   Access Address by only one bit.
        if (diff <= 1) {
            return false;
        }
        // all checks passed, address is valid!
        return true;
    }
}
//# sourceMappingURL=PublicUtil.js.map