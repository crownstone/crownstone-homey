import { ServiceData } from "./ServiceData";
export declare class Advertisement {
    id: any;
    name: any;
    handle: any;
    address: any;
    rssi: any;
    referenceId: any;
    serviceDataAvailable: boolean;
    serviceUUID: any;
    scanResponse: ServiceData;
    constructor(rawAdvertisement: any, referenceId: any);
    parse(rawAdvertisement: any): void;
    isSetupPackage(): boolean;
    isInDFUMode(): boolean;
    isCrownstoneFamily(): boolean;
    decrypt(key: any): void;
    process(): void;
    hasScanResponse(): boolean;
    setReadyForUse(): void;
    getJSON(): {
        handle: any;
        address: any;
        name: any;
        rssi: any;
        isCrownstoneFamily: boolean;
        isInDFUMode: boolean;
        referenceId: any;
    };
}
