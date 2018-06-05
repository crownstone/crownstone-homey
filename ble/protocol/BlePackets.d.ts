/// <reference types="node" />
export declare class BLEPacket {
    type: number;
    length: number;
    payloadBuffer: any;
    constructor(packetType: number);
    loadKey(keyString: any): this;
    loadString(string: any): this;
    loadInt8(int8: any): this;
    loadUInt8(uint8: any): this;
    loadUInt16(uint16: any): this;
    loadUInt32(uint32: any): this;
    loadByteArray(byteArray: any): this;
    loadBuffer(buffer: any): this;
    _process(): this;
    getPacket(reserved?: number): Buffer;
}
export declare class ControlPacket extends BLEPacket {
}
export declare class keepAliveStatePacket extends ControlPacket {
    constructor(action: any, state: any, timeout: any);
}
export declare class FactoryResetPacket extends ControlPacket {
    constructor();
}
export declare class ReadConfigPacket extends BLEPacket {
    getOpCode(): number;
    getPacket(): Buffer;
}
export declare class WriteConfigPacket extends ReadConfigPacket {
    getOpCode(): number;
}
export declare class ReadStatePacket extends BLEPacket {
    getOpCode(): number;
    getPacket(): Buffer;
}
export declare class WriteStatePacket extends ReadStatePacket {
    getOpCode(): number;
}
export declare class NotificationStatePacket extends ReadStatePacket {
    constructor(packetType: any, subscribe: any);
    getOpCode(): number;
}
