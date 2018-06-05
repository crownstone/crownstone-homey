/// <reference types="node" />
export declare class ControlPacketsGenerator {
    static getFactoryResetPacket(): Buffer;
    static getSetSchedulePacket(data: any): Buffer;
    static getScheduleRemovePacket(timerIndex: any): Buffer;
    static getCommandFactoryResetPacket(): Buffer;
    static getSwitchStatePacket(switchState: any): Buffer;
    static getResetPacket(): Buffer;
    static getPutInDFUPacket(): Buffer;
    static getDisconnectPacket(): Buffer;
    /**
     * @param state : 0 or 1
     * @returns {Buffer}
     */
    static getRelaySwitchPacket(state: any): Buffer;
    /**
     * @param switchState   [0 .. 1]
     * @returns {Buffer}
     */
    static getPwmSwitchPacket(switchState: any): Buffer;
    static getKeepAliveStatePacket(changeState: any, switchState: any, timeout: any): Buffer;
    static getKeepAliveRepeatPacket(): Buffer;
    static getResetErrorPacket(errorMask: any): Buffer;
    /**
     * This is a LOCAL timestamp since epoch in seconds
  
     so if you live in GMT + 1 add 3600 to the timestamp
  
     * @param time
     * @returns {Buffer}
     */
    static getSetTimePacket(time: any): Buffer;
    static getAllowDimmingPacket(allow: any): Buffer;
    static getLockSwitchPacket(lock: any): Buffer;
    static getSetupPacket(type: any, crownstoneId: any, adminKey: Buffer, memberKey: Buffer, guestKey: Buffer, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Buffer;
}
