/**
 * Created by alex on 25/08/16.
 */
import { cloudApiBase } from "./cloudApiBase";

export const preferences : preferences_cloudModule = {
getPreferences: function () {
    return cloudApiBase._setupRequest(
      'GET',
      '/Devices/{id}/preferences',
      {},
      'query'
    );
  },

  createPreference: function (data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Devices/{id}/preferences',
      {data: data},
      'body'
    );
  },

  updatePreference: function (preferenceCloudId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Devices/{id}/preferences/' + preferenceCloudId,
      {data: data},
      'body'
    );
  },

  deletePreference: function (preferenceCloudId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Devices/{id}/preferences/' + preferenceCloudId,
      {},
      'body'
    );
  },
};