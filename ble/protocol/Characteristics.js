"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceCharacteristics = {
    HardwareRevision: "2a27",
    FirmwareRevision: "2a26",
};
exports.CrownstoneCharacteristics = {
    Control: "24f000017d104805bfc17663a01c3bff",
    MeshControl: "24f000027d104805bfc17663a01c3bff",
    ConfigControl: "24f000047d104805bfc17663a01c3bff",
    ConfigRead: "24f000057d104805bfc17663a01c3bff",
    StateControl: "24f000067d104805bfc17663a01c3bff",
    StateRead: "24f000077d104805bfc17663a01c3bff",
    SessionNonce: "24f000087d104805bfc17663a01c3bff",
    FactoryReset: "24f000097d104805bfc17663a01c3bff",
};
exports.SetupCharacteristics = {
    Control: "24f100017d104805bfc17663a01c3bff",
    MacAddress: "24f100027d104805bfc17663a01c3bff",
    SessionKey: "24f100037d104805bfc17663a01c3bff",
    ConfigControl: "24f100047d104805bfc17663a01c3bff",
    ConfigRead: "24f100057d104805bfc17663a01c3bff",
    GoToDFU: "24f100067d104805bfc17663a01c3bff",
    SetupControl: "24f100077d104805bfc17663a01c3bff",
    SessionNonce: "24f100087d104805bfc17663a01c3bff",
};
exports.GeneralCharacteristics = {
    Temperature: "24f200017d104805bfc17663a01c3bff",
    Reset: "24f200027d104805bfc17663a01c3bff",
};
exports.PowerCharacteristics = {
    PWM: "24f300017d104805bfc17663a01c3bff",
    Relay: "24f300027d104805bfc17663a01c3bff",
    PowerSamples: "24f300037d104805bfc17663a01c3bff",
    PowerConsumption: "24f300047d104805bfc17663a01c3bff",
};
exports.IndoorLocalizationCharacteristics = {
    TrackControl: "24f400017d104805bfc17663a01c3bff",
    TrackedDevices: "24f400027d104805bfc17663a01c3bff",
    ScanControl: "24f400037d104805bfc17663a01c3bff",
    ScannedDevices: "24f400047d104805bfc17663a01c3bff",
    RSSI: "24f400057d104805bfc17663a01c3bff",
};
exports.ScheduleCharacteristics = {
    SetTime: "24f500017d104805bfc17663a01c3bff",
    ScheduleWrite: "24f500027d104805bfc17663a01c3bff",
    ScheduleRead: "24f500037d104805bfc17663a01c3bff",
};
exports.MeshCharacteristics = {
    MeshData: "2a1e0004fd51d8828ba8b98c0000cd1e",
    Value: "2a1e0005fd51d8828ba8b98c0000cd1e",
};
exports.DFUCharacteristics = {
    ControlPoint: "000015311212EFDE1523785FEABCD123",
    Packet: "000015321212EFDE1523785FEABCD123",
};
//# sourceMappingURL=Characteristics.js.map