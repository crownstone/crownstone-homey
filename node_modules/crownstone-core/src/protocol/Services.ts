export const CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID        = "c001";
export const CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID     = "c002";
export const CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID  = "c003";
export const DFU_ADVERTISEMENT_SERVICE_UUID                    = "00001530-1212-EFDE-1523-785FEABCD123";

export const CSServices = {
  DeviceInformation         : "180a",
  CrownstoneService         : "24f000007d104805bfc17663a01c3bff",
  SetupService              : "24f100007d104805bfc17663a01c3bff",
  GeneralService            : "24f200007d104805bfc17663a01c3bff",
  PowerService              : "24f300007d104805bfc17663a01c3bff",
  IndoorLocalizationService : "24f400007d104805bfc17663a01c3bff",
  ScheduleService           : "24f500007d104805bfc17663a01c3bff",
  MeshService               : "0000fee400001000800000805f9b34fb",
};

export const DFUServices = {
  DFU : DFU_ADVERTISEMENT_SERVICE_UUID
};

export const ServiceUUIDArray = [
  CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
  CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
  CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID.toLowerCase(),
];