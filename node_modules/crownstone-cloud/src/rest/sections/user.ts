import { cloudApiBase } from "./cloudApiBase";

export const user : user_cloudModule = {
/**
   *
   * @param options
   * @returns {Promise}
   */
  registerUser: function(options) {
    return cloudApiBase._setupRequest('POST', 'users', {data:{
      email: options.email,
      password: options.password,
      firstName: options.firstName,
      lastName: options.lastName
    }}, 'body');
  },

  /**
   *
   * @param options
   * {
   *   email: string,
   *   password: string,
   *   onUnverified: callback,
   *   onInvalidCredentials: callback,
   * }
   *
   * resolves with the parsed data, rejects with {status: httpStatus, data: data}
   */
  login: function(options) {
    return cloudApiBase._setupRequest('POST', 'users/login', {
      data: {
        email: options.email,
        password: options.password,
        ttl: 7*24*3600
      },
      noAccessToken: true
    }, 'body');

  },


  /**
   *
   * @param file {String} --> full path string.
   */
  setEarlyAccess: function(level) {
    return cloudApiBase._setupRequest('PUT', '/users/{id}', {data: { earlyAccessLevel: level }}, 'body');
  },

  removeProfileImage: function() {
    return cloudApiBase._setupRequest(
      'DELETE',
      'users/{id}/profilePic',
    );
  },

  /**
   *
   * @returns {*}
   */
  getUserData: function () {
    return cloudApiBase._setupRequest('GET', '/users/{id}', );
  },

  /**
   *
   * @returns {*}
   */
  getUserId: function () {
    return cloudApiBase._setupRequest('GET', '/users/userId' );
  },

  /**
   *
   * @returns {*}
   */
  getPendingInvites: function () {
    return cloudApiBase._setupRequest('GET', '/users/{id}/pendingInvites', );
  },

  /**
   *
   * @param data
   * @returns {Promise}
   */
  updateUserData: function(data) {
    return cloudApiBase._setupRequest('PUT', '/users/{id}', {data: data}, 'body');
  },

  /**
   *
   * @param options
   */
  requestVerificationEmail: function(options : any = {}) {
    return cloudApiBase._setupRequest(
      'POST',
      'users/resendVerification',
      { data: { email: options.email } },
      'query'
    );
  },

  /**
   *
   * @param options
   */
  requestPasswordResetEmail: function(options : any = {}) {
    return cloudApiBase._setupRequest(
      'POST',
      'users/reset',
      { data: { email: options.email } },
      'body'
    );
  },

  getKeys: function(cloudSphereId = undefined, cloudStoneId = undefined) {

    return cloudApiBase._setupRequest(
      'GET',
      'users/{id}/keysV2',
      {data: { sphereId: cloudSphereId, stoneId: cloudStoneId }},
      "query"
    );
  },


};