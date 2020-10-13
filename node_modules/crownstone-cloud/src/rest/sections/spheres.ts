
import { TokenStore } from "./cloudApiBase";
import { stones } from "./stones";
import { locations } from "./locations";
import { REST } from "../cloudAPI";

export const spheres : spheres_cloudModule = {
updateSphere: function(cloudSphereId, data) {
    return REST._setupRequest(
      'PUT',
      '/Spheres/' + cloudSphereId,
      {data: data},
      'body'
    );
  },

  inviteUser: function(email, permission = "") {
    permission = permission.toLowerCase();
    switch (permission) {
      case 'admin':
        return REST._setupRequest('PUT', '/Spheres/{id}/admins', { data: { email: email }});
      case 'member':
        return REST._setupRequest('PUT', '/Spheres/{id}/members', { data: { email: email }});
      case 'guest':
        return REST._setupRequest('PUT', '/Spheres/{id}/guests', { data: { email: email }});
      default:
        return new Promise((resolve, reject) => {
          reject(new Error('Invalid Permission: "' + permission + '"'))
        });
    }
  },

  getPendingSphereInvites: function() {
    return REST._setupRequest('GET', '/Spheres/{id}/pendingInvites');
  },

  resendInvite: function(email) {
    return REST._setupRequest('GET', '/Spheres/{id}/resendInvite', {data:{email: email}});
  },

  revokeInvite: function(email) {
    return REST._setupRequest('GET', '/Spheres/{id}/removeInvite', {data:{email: email}});
  },



  /**
   *
   * @returns {*}
   */
  getSpheres: function () {
    return REST._setupRequest('GET', '/users/{id}/spheres', { data: {filter: {include:"floatingLocationPosition"}} });
  },

  getUsers: function () {
    return REST._setupRequest('GET', '/Spheres/{id}/users',  );
  },

  getAdmins: function () {
    return REST._setupRequest('GET', '/Spheres/{id}/admins', );
  },

  getMembers: function () {
    return REST._setupRequest('GET', '/Spheres/{id}/members', );
  },

  getGuests: function () {
    return REST._setupRequest('GET', '/Spheres/{id}/guests', );
  },

  getToons: function () {
    return REST._setupRequest('GET', '/Spheres/{id}/Toons', );
  },

  getPresentPeople: function (ignoreDeviceId) {
    return REST._setupRequest('GET', '/Spheres/{id}/PresentPeople', {
      data: { ignoreDeviceId: ignoreDeviceId },
    }, 'query');
  },


  /**
   * @param data
   */
  createSphere: function(data) {
    return REST._setupRequest('POST', 'users/{id}/spheres', { data: data }, 'body');
  },

  changeSphereName: function(sphereName) {
    return REST._setupRequest('PUT', '/Spheres/{id}', { data: { name: sphereName }}, 'body');
  },

  changeUserAccess: function(email, accessLevel) {
    return REST._setupRequest('PUT', '/Spheres/{id}/role', {data: {email: email, role:accessLevel} }, 'query');
  },

  updateFloatingLocationPosition: function (data) {
    return REST._setupRequest(
      'POST',
      '/Spheres/{id}/floatingLocationPosition/',
      {data: data},
      'body'
    );
  },

  deleteUserFromSphere: function(userId) {
    // userId is the same in the rest as it is locally
    return REST._setupRequest('DELETE', '/Spheres/{id}/users/rel/' + userId);
  },

  deleteSphere: function() {
    let sphereId = TokenStore.sphereId;

    let promises      = [];
    let stoneData     = [];
    let locationData  = [];

    promises.push(
      stones.getStonesInSphere()
        .then((stones : any) => {
          stoneData = stones;
        }).catch((err) => {})
    );


    // for every sphere, we get the locations
    promises.push(
      locations.getLocations()
        .then((locations : any) => {
          locationData = locations;
        }).catch((err) => {})
    );

    return Promise.all(promises)
      .then(() => {
        let deletePromises = [];

        stoneData.forEach((stone) => {
          deletePromises.push(REST.forSphere(sphereId).deleteStone(stone.id));
        });

        locationData.forEach((location) => {
          deletePromises.push(REST.forSphere(sphereId).deleteLocation(location.id));
        });

        return Promise.all(deletePromises);
      })
      .then(() => {
        return this._deleteSphere(sphereId);
      })
  },

  _deleteSphere: function(cloudSphereId) {
    if (cloudSphereId) {
      return REST._setupRequest(
        'DELETE',
        'Spheres/' + cloudSphereId
      );
    }
  },

  leaveSphere: function(cloudSphereId) {
    if (cloudSphereId) {
      return REST._setupRequest(
        'DELETE',
        'users/{id}/spheres/rel/' + cloudSphereId
      );
    }
  },

  acceptInvitation: function() {
    return REST._setupRequest(
      'POST',
      '/Spheres/{id}/inviteAccept/',
      {},
      'body'
      );
  },

  declineInvitation: function() {
    return REST._setupRequest(
      'POST',
      '/Spheres/{id}/inviteDecline/',
      {},
      'body'
      );
  },


  getSphereAuthorizationTokens: function(sphereId? : string) {
    if (sphereId) { TokenStore.sphereId = sphereId; }
    return REST._setupRequest(
      'GET',
      'Spheres/{id}/tokenData'
    );
  }

};
