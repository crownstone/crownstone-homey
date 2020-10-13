import { cloudApiBase } from "./cloudApiBase";

export const stonesAbilities : stonesAbilities_cloudModule = {
getStoneAbilities: function() {
    return cloudApiBase._setupRequest(
      'GET',
      '/Stones/{id}/abilities/',
      {},
      'body'
    );
  },

  setStoneAbilities: function(data: any) {
    return cloudApiBase._setupRequest(
      'PUT',
      '/Stones/{id}/abilities/',
      {data: data},
      'body'
    );
  },

};