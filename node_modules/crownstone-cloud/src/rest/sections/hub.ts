import { cloudApiBase } from "./cloudApiBase";

export const hub : hub_cloudModule = {
  hubLogin: function(hubId, hubToken) {
      let endpoint = 'Hubs/' + (hubId || "{id}") + "/login"
      return cloudApiBase._setupRequest('POST', endpoint, {
        data: {
          token: hubToken,
        },
        noAccessToken: true
      }, 'query');
    },

  updateHubIP: function(ip) {
      let endpoint = 'Hubs/localIP';
      return cloudApiBase._setupRequest('PUT', endpoint, {
        data: {
          localIpAddress: ip,
        },
        noAccessToken: true
      }, 'query');
    },

};