"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param currentTimestampInSeconds : number
 * @param LsbTimestamp              : number (uint16LE)
 * @returns {any}
 */
function _obtainTimestamp(fullTimeStamp, lsb) {
    let timestampBuffer = Buffer.alloc(4);
    timestampBuffer.writeUInt32BE(fullTimeStamp, 0);
    let lsbpBuffer = Buffer.alloc(2);
    lsbpBuffer.writeUInt16LE(lsb, 0);
    // assemble
    let resultBuffer = Buffer.alloc(4);
    resultBuffer.writeUInt8(timestampBuffer[0], 0);
    resultBuffer.writeUInt8(timestampBuffer[1], 1);
    resultBuffer.writeUInt8(lsbpBuffer[1], 2);
    resultBuffer.writeUInt8(lsbpBuffer[0], 3);
    return resultBuffer.readUInt32BE(0);
}
/**
 * @param currentTimestampInSeconds : number
 * @param LsbTimestamp              : number (uint16LE)
 * @returns {any}
 */
function reconstructTimestamp(currentTimestampInSeconds, LsbTimestamp) {
    // embed location data in timestamp
    // for holland in summer, getTimezoneOffset is -120, winter will be -60
    let minutesFromGMT = new Date(currentTimestampInSeconds * 1000).getTimezoneOffset();
    let correctedTimestamp = currentTimestampInSeconds + minutesFromGMT * 60;
    // attempt restoration
    let restoredTimestamp = _obtainTimestamp(correctedTimestamp, LsbTimestamp);
    let halfUInt16 = 0x7FFF; // roughly 9 hours in seconds
    // correct for overflows, check for drift from current time
    let delta = correctedTimestamp - restoredTimestamp;
    if (delta > -halfUInt16 && delta < halfUInt16) {
        return restoredTimestamp;
    }
    else if (delta < -halfUInt16) {
        restoredTimestamp = _obtainTimestamp(correctedTimestamp - 0xFFFF, LsbTimestamp);
    }
    else if (delta > halfUInt16) {
        restoredTimestamp = _obtainTimestamp(correctedTimestamp + 0xFFFF, LsbTimestamp);
    }
    return restoredTimestamp;
}
exports.reconstructTimestamp = reconstructTimestamp;
//# sourceMappingURL=Timestamp.js.map