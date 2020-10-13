import { cloudApiBase } from "./cloudApiBase";

export const devices : devices_cloudModule = {
getDevices: function () {
    return cloudApiBase._setupRequest('GET', '/users/{id}/devices', {data:{filter:{"include":"installations"}}});
  },

  createDevice: function (data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/users/{id}/devices',
      { data: data},
      'body'
    );
  },

  updateDevice: function (deviceId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Devices/' + deviceId,
      { data: data },
      'body'
    );
  },

  sendTestNotification: function() {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/testNotification/'
    );
  },

  deleteDevice: function(deviceId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/users/{id}/devices/' + deviceId
    );
  },

  deleteAllDevices: function() {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/users/{id}/deleteAllDevices'
    );
  },

  getTrackingNumberInSphere: function(cloudSphereId) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/trackingNumber/',
      { data: {sphereId:cloudSphereId} },
      'query'
    );
  },

  inSphere: function (cloudSphereId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/inSphere/',
      { data: {sphereId:cloudSphereId} },
      'query'
    );
  },

  inLocation: function (cloudSphereId, cloudLocationId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/inLocation/',
      { data: {sphereId:cloudSphereId, locationId:cloudLocationId } },
      'query'
    );
  },

  exitLocation: function (cloudSphereId, cloudLocationId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/exitLocation/',
      { data: {sphereId:cloudSphereId, locationId:cloudLocationId } },
      'query'
    );
  },

  exitSphere: function (cloudSphereId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/exitSphere/',
      { data: {sphereId:cloudSphereId} },
      'query'
    );
  },
};