// todo: add documentation
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });
class BLEPacket {
    constructor(packetType) {
        this.protocol = 5;
        this.type = 0;
        this.length = 0;
        this.payloadBuffer = null;
        this.type = packetType;
    }
    loadUInt8(uint8) {
        this.payloadBuffer = Buffer.alloc(1);
        this.payloadBuffer.writeUInt8(uint8);
        return this._process();
    }
    _process() {
        this.length = this.payloadBuffer.length;
        return this;
    }
    getPacket() {
        let packetLength = 1 + 2 + 2;
        let buffer = Buffer.alloc(packetLength);
        buffer.writeUInt8(this.protocol, 0);
        buffer.writeUInt16LE(this.type, 1);
        buffer.writeUInt16LE(this.length, 3);
        if (this.length > 0 && this.payloadBuffer) {
            buffer = Buffer.concat([buffer, this.payloadBuffer]);
        }
        return buffer;
    }
}
exports.BLEPacket = BLEPacket;
class ControlPacket extends BLEPacket {
}
exports.ControlPacket = ControlPacket;