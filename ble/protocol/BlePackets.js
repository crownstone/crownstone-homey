"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BluenetTypes_1 = require("./BluenetTypes");
class BLEPacket {
    constructor(packetType) {
        this.type = 0;
        this.length = 0;
        this.payloadBuffer = null;
        this.type = packetType;
    }
    loadKey(keyString) {
        if (keyString.length === 16) {
            this.payloadBuffer = Buffer.from(keyString, 'ascii');
        }
        else {
            this.payloadBuffer = Buffer.from(keyString, 'hex');
        }
        return this._process();
    }
    loadString(string) {
        this.payloadBuffer = Buffer.from(string, 'ascii');
        return this._process();
    }
    loadInt8(int8) {
        this.payloadBuffer = Buffer.alloc(1);
        this.payloadBuffer.writeInt8(int8);
        return this._process();
    }
    loadUInt8(uint8) {
        this.payloadBuffer = Buffer.alloc(1);
        this.payloadBuffer.writeUInt8(uint8);
        return this._process();
    }
    loadUInt16(uint16) {
        this.payloadBuffer = Buffer.alloc(2);
        this.payloadBuffer.writeUInt16LE(uint16);
        return this._process();
    }
    loadUInt32(uint32) {
        this.payloadBuffer = Buffer.alloc(4);
        this.payloadBuffer.writeUInt32LE(uint32);
        return this._process();
    }
    loadByteArray(byteArray) {
        this.payloadBuffer = Buffer.from(byteArray);
        return this._process();
    }
    loadBuffer(buffer) {
        this.payloadBuffer = buffer;
        return this._process();
    }
    _process() {
        this.length = this.payloadBuffer.length;
        return this;
    }
    getPacket(reserved = 0) {
        let packetLength = 1 + 1 + 2;
        let buffer = Buffer.alloc(packetLength);
        buffer.writeUInt8(this.type, 0);
        buffer.writeUInt8(reserved, 1); // reserved
        buffer.writeUInt16LE(this.length, 2); // length
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
class keepAliveStatePacket extends ControlPacket {
    constructor(action, state, timeout) {
        let keepAliveBuffer = Buffer.alloc(4);
        keepAliveBuffer.writeUInt8(action, 0);
        keepAliveBuffer.writeUInt8(state, 1);
        keepAliveBuffer.writeUInt16LE(timeout, 2);
        super(BluenetTypes_1.ControlType.KEEP_ALIVE_STATE);
        this.loadBuffer(keepAliveBuffer);
    }
}
exports.keepAliveStatePacket = keepAliveStatePacket;
class FactoryResetPacket extends ControlPacket {
    constructor() {
        super(BluenetTypes_1.ControlType.FACTORY_RESET);
        this.loadUInt32(0xdeadbeef);
    }
}
exports.FactoryResetPacket = FactoryResetPacket;
class ReadConfigPacket extends BLEPacket {
    getOpCode() {
        return BluenetTypes_1.OpCode.READ;
    }
    getPacket() {
        return super.getPacket(this.getOpCode());
    }
}
exports.ReadConfigPacket = ReadConfigPacket;
class WriteConfigPacket extends ReadConfigPacket {
    getOpCode() {
        return BluenetTypes_1.OpCode.WRITE;
    }
}
exports.WriteConfigPacket = WriteConfigPacket;
class ReadStatePacket extends BLEPacket {
    getOpCode() {
        return BluenetTypes_1.OpCode.READ;
    }
    getPacket() {
        return super.getPacket(this.getOpCode());
    }
}
exports.ReadStatePacket = ReadStatePacket;
class WriteStatePacket extends ReadStatePacket {
    getOpCode() {
        return BluenetTypes_1.OpCode.WRITE;
    }
}
exports.WriteStatePacket = WriteStatePacket;
class NotificationStatePacket extends ReadStatePacket {
    constructor(packetType, subscribe) {
        super(packetType);
        this.loadUInt8(subscribe ? 1 : 0);
    }
    getOpCode() {
        return BluenetTypes_1.OpCode.NOTIFY;
    }
}
exports.NotificationStatePacket = NotificationStatePacket;
//# sourceMappingURL=BlePackets.js.map