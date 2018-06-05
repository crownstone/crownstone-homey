/// <reference types="node" />
export declare class NotificationMerger {
    data: any;
    callback: any;
    lastPacketIndex: any;
    constructor(callback: any);
    /**
     * Incoming data has an index byte on the first byte
     * @param incomingData
     */
    merge(incomingData: Buffer): void;
}
