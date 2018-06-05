/// <reference types="node" />
/**
 * Wrapper for all relevant data of the object
 *
 */
export declare class ResultPacket {
    type: any;
    opCode: any;
    length: any;
    payload: any;
    valid: boolean;
    constructor(data: Buffer);
    getUInt16Payload(): any;
}
