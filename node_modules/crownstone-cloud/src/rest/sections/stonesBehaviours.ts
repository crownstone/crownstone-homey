import { cloudApiBase } from "./cloudApiBase";

export const stonesBehaviours : stonesBehaviours_cloudModule = {
createBehaviour: function(data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Stones/{id}/behaviours/',
      {data: data},
      'body'
    );
  },
  updateBehaviour: function(cloudBehaviourId, data) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Stones/{id}/behaviours/' + cloudBehaviourId,
      {data:data},
      'body'
    );
  },
  deleteBehaviour: function(cloudBehaviourId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Stones/{id}/behaviours/' + cloudBehaviourId,
    );
  },
  deleteAllBehaviours: function() {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Stones/{id}/behaviours/',
    );
  },
  getBehaviours: function() {
    return cloudApiBase._setupRequest(
      'GET',
      '/Stones/{id}/behaviours/',
    );
  },


};