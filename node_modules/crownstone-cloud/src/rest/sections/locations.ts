import { cloudApiBase } from "./cloudApiBase";

export const locations : locations_cloudModule = {
getLocations: function () {
    return cloudApiBase._setupRequest('GET', '/Spheres/{id}/ownedLocations', {data:{filter:{"include":["sphereOverviewPosition","presentPeople"]}}});
  },

  createLocation: function (data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Spheres/{id}/ownedLocations',
      {data: data},
      'body'
    );
  },

  updateLocation: function (cloudLocationId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Spheres/{id}/ownedLocations/' + cloudLocationId,
      {data: data},
      'body'
    );
  },

  updateLocationPosition: function (data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Locations/{id}/sphereOverviewPosition/',
      {data: data},
      'body'
    );
  },

  deleteLocation: function(cloudLocationId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Spheres/{id}/ownedLocations/' + cloudLocationId
    );
  },


  deleteLocationPicture: function() {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Locations/{id}/image/'
    );
  },
};