"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID = "c001";
exports.CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID = "c002";
exports.CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID = "c003";
exports.DFU_ADVERTISEMENT_SERVICE_UUID = "00001530-1212-EFDE-1523-785FEABCD123";
exports.CSServices = {
    DeviceInformation: "180a",
    CrownstoneService: "24f000007d104805bfc17663a01c3bff",
    SetupService: "24f100007d104805bfc17663a01c3bff",
    GeneralService: "24f200007d104805bfc17663a01c3bff",
    PowerService: "24f300007d104805bfc17663a01c3bff",
    IndoorLocalizationService: "24f400007d104805bfc17663a01c3bff",
    ScheduleService: "24f500007d104805bfc17663a01c3bff",
    MeshService: "0000fee400001000800000805f9b34fb",
};
exports.DFUServices = {
    DFU: exports.DFU_ADVERTISEMENT_SERVICE_UUID
};
exports.ServiceUUIDArray = [
    exports.CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
    exports.CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
    exports.CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
];
//# sourceMappingURL=Services.js.map