import { Advertisement } from "../packets/Advertisement";
import { ServiceData } from "../packets/ServiceData";
export declare class StoneTracker {
    uniqueIdentifier: string;
    crownstoneId: number;
    verified: boolean;
    dfu: boolean;
    consecutiveMatches: number;
    rssi: number;
    rssiHistory: {};
    name: string;
    handle: any;
    avgRssi: number;
    lastUpdate: number;
    timeoutTime: number;
    timeoutDuration: number;
    rssiTimeoutList: any[];
    constructor();
    update(advertisement: Advertisement): void;
    handlePayload(advertisement: any): void;
    verify(serviceData: ServiceData): void;
    addValidMeasurement(serviceData: any): void;
    invalidateDevice(serviceData: any): void;
    calculateRssiAverage(): number;
}
