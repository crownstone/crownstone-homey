import { cloudApiBase } from "./cloudApiBase";


export const firmware : firmware_cloudModule = {
getFirmwareDetails: function (version, hardwareVersion) {
    return cloudApiBase._setupRequest('GET', '/Firmwares?version=' + version + '&hardwareVersion=' + hardwareVersion);
  },

  getLatestAvailableFirmware: function () {
    return cloudApiBase._setupRequest('GET', '/Firmwares/latest');
  },
};