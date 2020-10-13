export const UserLevel = {
  admin: 0,
  member: 1,
  basic: 2,
  setup: 100,
  unknown: 255,
};


export const CrownstoneErrorType = {
  INPUT_ERROR:                          "INPUT_ERROR",
  COULD_NOT_VALIDATE_SESSION_NONCE:     "COULD_NOT_VALIDATE_SESSION_NONCE",
  INCOMPATIBLE_FIRMWARE:                "INCOMPATIBLE_FIRMWARE",
  NO_ENCRYPTION_KEYS:                   "NO_ENCRYPTION_KEYS",
  ALREADY_CONNECTED_TO_SOMETHING_ELSE:  "ALREADY_CONNECTED_TO_SOMETHING_ELSE",
  INVALID_PERIPHERAL:                   "INVALID_PERIPHERAL",
  INVALID_DATA_LENGTH:                  "INVALID_DATA_LENGTH",
  BUFFER_TOO_SHORT_FOR_DATA:            "BUFFER_TOO_SHORT_FOR_DATA",
};

export const GetPesistenceMode = {
  CURRENT          : 0,
  STORED           : 1,
  FIRMWARE_DEFAULT : 2,
}
export const SetPesistenceMode = {
  TEMPORARY : 0,
  STORED    : 1,
}

