
export const ControlType = {
  SETUP                      : 0,
  FACTORY_RESET              : 1,
  GET_STATE                  : 2,
  SET_STATE                  : 3,
  RESET                      : 10,
  GOTO_DFU                   : 11,
  NO_OPERATION               : 12,
  DISCONNECT                 : 13,
  SWITCH                     : 20,
  MULTISWITCH                : 21,
  PWM                        : 22,
  RELAY                      : 23,
  SET_TIME                   : 30,
  SET_TX                     : 31,
  RESET_ERRORS               : 32,
  MESH_COMMAND               : 33,
  SET_SUN_TIME               : 34,
  ALLOW_DIMMING              : 40,
  LOCK_SWITCH                : 41,
  UART_MESSAGE               : 50,
  SAVE_BEHAVIOUR             : 60,
  REPLACE_BEHAVIOUR          : 61,
  REMOVE_BEHAVIOUR           : 62,
  GET_BEHAVIOUR              : 63,
  GET_BEHAVIOUR_INDICES      : 64,
  GET_BEHAVIOUR_DEBUG        : 69,
  REGISTER_TRACKED_DEVICE    : 70,
  UNSPECIFIED                : 65535
};

export let ControlTypeInv = {}
Object.keys(ControlType).forEach((value) => { ControlTypeInv[ControlType[value]] = value; })


export const StateType = {
  PWM_PERIOD               : 5,
  IBEACON_MAJOR            : 6,
  IBEACON_MINOR            : 7,
  IBEACON_UUID             : 8,
  IBEACON_TX_POWER         : 9,
  TX_POWER                 : 11,
  ADVERTISEMENT_INTERVAL   : 12,
  SCAN_DURATION            : 16,
  SCAN_BREAK_DURATION      : 18,
  BOOT_DELAY               : 19,
  MAX_CHIP_TEMP            : 20,
  MESH_ENABLED             : 24,
  ENCRYPTION_ENABLED       : 25,
  IBEACON_ENABLED          : 26,
  SCANNER_ENABLED          : 27,
  SPHERE_UID               : 33,
  CROWNSTONE_IDENTIFIER    : 34,
  ADMIN_ENCRYPTION_KEY     : 35,
  MEMBER_ENCRYPTION_KEY    : 36,
  BASIC_ENCRYPTION_KEY     : 37,
  SCAN_INTERVAL            : 39,
  SCAN_WINDOW              : 40,
  RELAY_HIGH_DURATION      : 41,
  LOW_TX_POWER             : 42,
  VOLTAGE_MULTIPLIER       : 43,
  CURRENT_MULITPLIER       : 44,
  VOLTAGE_ZERO             : 45,
  CURRENT_ZERO             : 46,
  POWER_ZERO               : 47,
  CURRENT_CONSUMPTION_THRESHOLD       : 50,
  CURRENT_CONSUMPTION_THRESHOLD_DIMMER: 51,
  DIMMER_TEMP_UP_VOLTAGE   : 52,
  DIMMER_TEMP_DOWN_VOLTAGE : 53,
  DIMMING_ALLOWED          : 54,
  SWITCH_LOCKED            : 55,
  SWITCHCRAFT_ENABLED      : 56,
  SWITCHCRAFT_THRESHOLD    : 57,
  UART_ENABLED             : 59,
  DEVICE_NAME              : 60,
  SERVICE_DATA_KEY         : 61,
  MESH_DEVICE_KEY          : 62,
  MESH_APPLICATION_KEY     : 63,
  MESH_NETWORK_KEY         : 64,
  LOCALIZATION_KEY         : 65,
  START_DIMMER_ON_ZERO_CROSSING       : 66,
  TAP_TO_TOGGLE_ENABLED               : 67,
  TAP_TO_TOGGLE_RSSI_THRESHOLD_OFFSET : 68,
  RESET_COUNTER            : 128,
  SWITCH_STATE             : 129,
  ACCUMULATED_ENERGY       : 130,
  POWER_USAGE              : 131,
  TRACKED_DEVICES          : 132,
  SCHEDULE                 : 133,
  OPERATION_MODE           : 134,
  TEMPERATURE              : 135,
  TIME                     : 136,
  ERROR_BITMASK            : 139,
  SUNTIMES                 : 149,
  BEHAVIOUR_SETTINGS       : 150,
};

export const DeviceType = {
  UNDEFINED             : 0,
  PLUG                  : 1,
  GUIDESTONE            : 2,
  BUILTIN               : 3,
  CROWNSTONE_USB        : 4,
  BUILTIN_ONE           : 5,

  getLabel: function(value) {
    let keys = Object.keys(DeviceType);
    for (let i = 0; i < keys.length; i++) {
      if (DeviceType[keys[i]] === value) {
        return keys[i];
      }
    }
    return 'undefined';
  },
};

export const ResultValue = {
  SUCCESS               : 0,     // Completed successfully.
  WAIT_FOR_SUCCESS      : 1,     // Command is successful so far, but you need to wait for SUCCESS.
  BUFFER_UNASSIGNED     : 16,     // No buffer was assigned for the command.
  BUFFER_LOCKED         : 17,     // Buffer is locked, failed queue command.
  BUFFER_TO_SMALL       : 18,
  WRONG_PAYLOAD_LENGTH  : 32,     // Wrong payload length provided.
  WRONG_PARAMETER       : 33,     // Wrong parameter provided.
  INVALID_MESSAGE       : 34,     // invalid message provided.
  UNKNOWN_OP_CODE       : 35,     // Unknown operation code provided.
  UNKNOWN_TYPE          : 36,     // Unknown type provided.
  NOT_FOUND             : 37,     // The thing you were looking for was not found.
  NO_SPACE              : 38,
  BUSY                  : 39,
  NO_ACCESS             : 48,     // Invalid access for this command.
  NOT_AVAILABLE         : 64,     // Command currently not available.
  NOT_IMPLEMENTED       : 65,     // Command not implemented (not yet or not anymore).
  WRITE_DISABLED        : 80,     // Write is disabled for given type.
  ERR_WRITE_NOT_ALLOWED : 81,     // Direct write is not allowed for this type, use command instead.
  ADC_INVALID_CHANNEL   : 96,     // Invalid adc input channel selected.
};

export let ResultValueInv = {}
Object.keys(ResultValue).forEach((value) => { ResultValueInv[ResultValue[value]] = value; })

export const ProcessType = {
  CONTINUE              : 0,
  FINISHED              : 1,
  ABORT_ERROR           : 2,
};

export const BroadcastTypes = {
  NO_OP                 : 0,
  MULTI_SWITCH          : 1,
  SET_TIME              : 2,
  BEHAVIOUR_SETTINGS    : 3,
};
