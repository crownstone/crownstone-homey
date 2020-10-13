import {webhookApiBase} from "./webhookApiBase";

export const listeners : listeners_webhookModule = {

  isListenerActive: function(token) {
    let endpoint = 'listeners/active'
    return webhookApiBase._setupRequest('GET', endpoint, {
      data: {
        token: token,
      },
    }, 'query');
  },

  deleteListenersByToken: function(token) {
    let endpoint = 'listeners/token'
    return webhookApiBase._setupRequest('DELETE', endpoint, {
      data: {
        token: token,
      },
    }, 'query');
  },


  deleteListener: function(listenerId) {
    let endpoint = 'listeners/' + listenerId
    return webhookApiBase._setupRequest('DELETE', endpoint);
  },

  createListener: function(listenerData) {
    let endpoint = 'listeners/'
    return webhookApiBase._setupRequest('POST', endpoint,{data: listenerData}, "body");
  },

  getListeners: function() {
    let endpoint = 'listeners/'
    return webhookApiBase._setupRequest('GET', endpoint);
  },

};