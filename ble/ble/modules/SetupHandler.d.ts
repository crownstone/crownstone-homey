/// <reference types="node" />
import { BleHandler } from "../BleHandler";
export declare class SetupHandler {
    ble: BleHandler;
    constructor(ble: any);
    setup(crownstoneId: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<{}>;
    _performFastSetup(crownstoneId: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<void>;
    _handleSetupPhaseEncryption(): Promise<void>;
    _commandSetup(crownstoneId: any, adminKey: any, memberKey: any, guestKey: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<void>;
    _getSessionKey(): Promise<Buffer>;
    _getSessionNonce(): Promise<Buffer>;
}
