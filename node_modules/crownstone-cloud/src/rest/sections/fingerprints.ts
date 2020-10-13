import { cloudApiBase } from "./cloudApiBase";

export const fingerprints : fingerprints_cloudModule = {
createFingerprint: function (cloudLocationId, data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/fingerprint?locationId='+cloudLocationId,
      { data: data },
      'body'
    );
  },

  getFingerprintsInLocations: function (cloudLocationIdArray) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/fingerprintsForLocations?locationIds='+JSON.stringify(cloudLocationIdArray),
      {},
    );
  },

  getFingerprints: function (fingerprintIdArray) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/fingerprints?fingerprintIds='+JSON.stringify(fingerprintIdArray),
      {},
    );
  },

  updateFingerprint: function (fingerprintId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Devices/{id}/fingerprint?fingerprintId='+fingerprintId,
      { data:data },
      'body'
    );
  },


  getMatchingFingerprintsInLocations: function (cloudLocationIdArray) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/fingerprintsMatching?locationIds='+JSON.stringify(cloudLocationIdArray),
    );
  },


  linkFingerprints: function (fingerprintIdArray) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/fingerprintsLink?fingerprintIds='+JSON.stringify(fingerprintIdArray),
    );
  },


  getFingerprintUpdateTimes: function (fingerprintIdArray) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/fingerprintsUpdatedAt?fingerprintIds='+JSON.stringify(fingerprintIdArray),
    );
  },
};