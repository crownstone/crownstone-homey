import { cloudApiBase } from "./cloudApiBase";

export const bootloader : bootloader_cloudModule = {
getBootloaderDetails: function (version, hardwareVersion) {
    return cloudApiBase._setupRequest('GET', '/Bootloaders?version=' + version + '&hardwareVersion=' + hardwareVersion);
  },

  getLatestAvailableBootloader: function () {
    return cloudApiBase._setupRequest('GET', '/Bootloaders/latest');
  },
};