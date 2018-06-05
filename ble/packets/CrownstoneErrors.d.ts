export declare class CrownstoneErrors {
    overCurrent: boolean;
    overCurrentDimmer: boolean;
    temperatureChip: boolean;
    temperatureDimmer: boolean;
    dimmerOnFailure: boolean;
    dimmerOffFailure: boolean;
    bitMask: number;
    constructor(bitMask: any);
    loadJSON(dictionary: any): void;
    getResetMask(): number;
    hasErrors(): boolean;
    getJSON(): {
        overCurrent: boolean;
        overCurrentDimmer: boolean;
        temperatureChip: boolean;
        temperatureDimmer: boolean;
        dimmerOnFailure: boolean;
        dimmerOffFailure: boolean;
        bitMask: number;
    };
}
