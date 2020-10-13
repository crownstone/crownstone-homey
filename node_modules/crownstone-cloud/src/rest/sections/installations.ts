import { cloudApiBase } from "./cloudApiBase";

export const installations : installations_cloudModule = {
getInstallations: function (options : any = {}) {
    return cloudApiBase._setupRequest('GET', '/Devices/{id}/installations', options);
  },

  createInstallation: function (appName, data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/installations?appName=' + appName,
      { data: data },
      'body'
    );
  },

  updateInstallation: function (installationId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/AppInstallations/' + installationId,
      { data: data },
      'body'
    );
  },

  getInstallation: function (installationId) {
    return cloudApiBase._setupRequest('GET','/AppInstallations/' + installationId);
  },

  deleteInstallation: function(installationId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Devices/{id}/devices/' + installationId
    );
  }
};