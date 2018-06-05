import { BleHandler } from "./ble/BleHandler";
import { BluenetSettings } from "./BluenetSettings";
import { ControlHandler } from "./ble/modules/ControlHandler";
import { CloudHandler } from "./cloud/CloudHandler";
import { SetupHandler } from "./ble/modules/SetupHandler";
export default class Bluenet {
    ble: BleHandler;
    settings: BluenetSettings;
    control: ControlHandler;
    setup: SetupHandler;
    cloud: CloudHandler;
    constructor();
    /**
     *
     * @param keys
     * @param {string} referenceId
     * @param {boolean} encryptionEnabled
     */
    setSettings(keys: any, referenceId?: string, encryptionEnabled?: boolean): void;
    linkCloud(userData: any): Promise<{}> | Promise<void>;
    connect(connectData: any): Promise<void>;
    wait(seconds: any): Promise<{}>;
    setupCrownstone(handle: any, crownstoneId: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<{}>;
    disconnect(): Promise<{}>;
    on(topic: any, callback: any): any;
}
