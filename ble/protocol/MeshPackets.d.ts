/// <reference types="node" />
declare class StoneKeepAlivePacket {
    crownstoneId: number;
    actionAndState: number;
    /**
     crownstoneId: byte
     action:  boolean
     state:  number [0..1]
     */
    constructor(crownstoneId: any, action: any, state: any);
    getPacket(): Buffer;
}
declare class MeshKeepAlivePacket {
    type: number;
    timeout: number;
    reserved: any[];
    packets: any[];
    contructor(packetType: any, timeout: any, packets: [StoneKeepAlivePacket]): void;
    getPacket(): Buffer;
}
declare class MeshCommandPacket {
    type: number;
    bitmask: number;
    crownstoneIds: any[];
    payload: Buffer;
    contructor(packetType: any, crownstoneIds: [number], payload: Buffer): void;
    getPacket(): Buffer;
}
declare class StoneMultiSwitchPacket {
    timeout: number;
    crownstoneId: number;
    state: number;
    intent: number;
    /**
     * crownstoneId:
     * state:  number [0..1]
     * timeout:
     * intent: intentType
     **/
    contructor(crownstoneId: number, state: number, timeout: number, intent: any): void;
    getPacket(): Buffer;
}
declare class MeshMultiSwitchPacket {
    type: number;
    packets: any[];
    contructor(packetType: any, packets: [StoneMultiSwitchPacket]): void;
    getPacket(): Buffer;
}
