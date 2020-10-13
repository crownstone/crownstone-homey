import { cloudApiBase } from "./cloudApiBase";

export const messages : messages_cloudModule = {
createMessage: function (data) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Spheres/{id}/messages',
      { data: data },
      'body'
    );
  },

  receivedMessage: function (cloudMessageId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Messages/' + cloudMessageId + '/delivered',
      {},
      'body'
    );
  },

  readMessage: function (cloudMessageId) {
    return cloudApiBase._setupRequest(
      'POST',
      '/Messages/' + cloudMessageId + '/read',
      {},
      'body'
    );
  },


  getMessage: function (cloudMessageId) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Messages/' + cloudMessageId,
      { data: {filter:{"include":["recipients","delivered","read"]}} }
    );
  },

  getNewMessagesInSphere: function () {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/myNewMessages',
    );
  },

  getAllMessagesInSphere: function () {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/myMessages',
    );
  },

  getNewMessagesInLocation: function (cloudLocationId) {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/myNewMessagesInLocation/' + cloudLocationId,
    );
  },

  getActiveMessages: function() {
    return cloudApiBase._setupRequest(
      'GET',
      '/Spheres/{id}/myActiveMessages/',

    );
  },

  addRecipient: function(recipientId) {
    // recipientId is a userId, these are the same in the rest as locally.
    return cloudApiBase._setupRequest(
      'PUT',
      '/Messages/{id}/recipients/rel/' + recipientId,
    );
  },

  deleteMessage: function (cloudMessageId) {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Spheres/{id}/messages/' + cloudMessageId,
    );
  },

  deleteAllMessages: function () {
    return cloudApiBase._setupRequest(
      'DELETE',
      '/Spheres/{id}/deleteAllMessages',
    );
  },
};