"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrapper for all relevant data of the object
 *
 */
class ResultPacket {
    constructor(data) {
        this.valid = false;
        if (data.length >= 4) {
            this.valid = true;
            this.type = data.readUInt8(0);
            this.opCode = data.readUInt8(1);
            this.length = data.readUInt16LE(2);
            let totalSize = 4 + this.length;
            if (data.length >= totalSize) {
                this.payload = data.slice(4);
            }
            else {
                this.valid = false;
            }
        }
        else {
            this.valid = false;
        }
    }
    getUInt16Payload() {
        if (this.valid == false) {
            return 65535;
        }
        if (this.length >= 2) {
            return this.payload.readUInt16LE(0);
        }
        else {
            return 65535;
        }
    }
}
exports.ResultPacket = ResultPacket;
//# sourceMappingURL=ResultPacket.js.map