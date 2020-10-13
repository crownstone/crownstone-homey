import { cloudApiBase, TokenStore } from "./cloudApiBase";
import { REST } from "../cloudAPI";

export const stones : stones_cloudModule = {
/**
   * Create a crownstone in the rest so the major and minor can be generated
   * @param data
   * @returns {*}
   */
  createStone: function(data : any) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Spheres/{id}/ownedStones/',
      {data:data},
      'body'
    );
  },


  /**
   * Update a crownstone in the rest
   * @param localStoneId
   * @param data
   * @returns {*}
   */
  updateStone: function(cloudStoneId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Spheres/{id}/ownedStones/' + cloudStoneId,
      {data: data},
      'body'
    );
  },

  /**
   * Update a crownstone in the rest
   * @param switchState
   * @returns {*}
   */
  updateStoneSwitchState: function(switchState) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Stones/{id}/currentSwitchState?switchState='  + switchState,
      {},
      'body'
    );
  },

  /**
   * Update a current energy usage
   * @param data
   * @returns {*}
   */
  updatePowerUsage: function(data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Stones/{id}/currentPowerUsage/',
      { data: data },
      'body'
    );
  },

  /**
   * Update a current energy usage
   * @param data
   * @returns {*}
   */
  updateBatchPowerUsage: function(data : any[]) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Stones/{id}/batchPowerUsage/',
      { data: data },
      'body'
    );
  },


  /**
   * !
   * !
   * ! ------------- DEPRECATED -----------------
   * !
   * !
   * Update the link from a crownstone to a room.
   * @param localLocationId
   * @param localSphereId
   * @param updatedAt
   * @param doNotSetUpdatedTimes
   * @returns {*}
   */
  updateStoneLocationLink: function(cloudLocationId, localSphereId, updatedAt, doNotSetUpdatedTimes = false) {
    return cloudApiBase._setupRequest(
        'PUT',
        '/Stones/{id}/locations/rel/' + cloudLocationId,
        {},
      )
      .then(() => {
        if (doNotSetUpdatedTimes !== true) {
          let promises = [];
          promises.push(REST.forSphere(localSphereId).updateStone(TokenStore.stoneId,{locationId: cloudLocationId, updatedAt: updatedAt}));
          promises.push(REST.forSphere(localSphereId).updateLocation(cloudLocationId,   {updatedAt: updatedAt}));
          // we set the updatedAt time in the rest since changing the links does not update the time there
          return Promise.all(promises);
        }
      })
  },


  /**
   * !
   * !
   * ! ------------- DEPRECATED -----------------
   * !
   * !
   * Delete the link from a crownstone to a room.
   * @param localLocationId
   * @param localSphereId
   * @param updatedAt
   * @returns {*}
   */
  deleteStoneLocationLink: function(cloudLocationId, localSphereId, updatedAt) {
    return cloudApiBase._setupRequest(
        'DELETE',
        '/Stones/{id}/locations/rel/' + cloudLocationId,
        {},
      )
      .then(() => {
        let promises = [];
        promises.push(REST.forSphere(localSphereId).updateStone(TokenStore.stoneId,{updatedAt: updatedAt}));
        promises.push(REST.forSphere(localSphereId).updateLocation(cloudLocationId,   {updatedAt: updatedAt}));
        // we set the updatedAt time in the rest since changing the links does not update the time there
        return Promise.all(promises);
      })
  },




  /**
   * request the data of all crownstones in this sphere
   * @returns {*}
   */
  getStonesInSphere: function() {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/ownedStones',
      {data: {filter:{"include":["locations", {"abilities":"properties"}, "behaviours"]}}}
    );
  },


  /**
   * request the data from this crownstone in the rest
   * @param localStoneId  database id of crownstone
   * @returns {*}
   */
  getStone: function(cloudStoneId) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Stones/' + cloudStoneId
    );
  },

  getAllStoneData: function() {
    return cloudApiBase._setupRequest(
      'GET',
      '/Stones/all',
      {data: {filter:{"include":["locations", {"abilities":"properties"}, "behaviours"]}}}
    );
  },

  /**
   * search for crownstone with this mac address
   * @param address  mac address
   * @returns {*}
   */
  findStone: function(address) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/ownedStones/',
      {data:{filter:{where:{address:address}}}},
      'query'
    );
  },

  /**
   * Delete the data from this crownstone in the rest in case of a failed setup or factory reset.
   * stoneId  database id of crownstone
   * @returns {*}
   */
  deleteStone: function(cloudStoneId) {
    if (cloudStoneId) {
      return cloudApiBase._setupRequest(
        'DELETE',
        '/Spheres/{id}/ownedStones/' + cloudStoneId
      );
    }
  },



  sendStoneDiagnosticInfo: function(data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Stones/{id}/diagnostics',
      { data: data },
      'body'
    );
  }


};