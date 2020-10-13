import {request} from "../../rest/cloudCore";
import {Logger} from "../../Logger";


export const defaultHeaders = {
'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export const uploadHeaders = {
'Accept': 'application/json',
  'Content-Type': 'multipart/form-data',
};

const log = Logger(__filename);

interface requestOptions {
  data?: any,
  noAccessToken?: boolean,
}

type requestType = 'query' | 'body';


class WebhookStoreClass {
  api_key:    string
  listenerId: string
  userId:     string
}

export const WebhookStore = new WebhookStoreClass();


/**
 * The rest API is designed to maintain the REST endpoints and to handle responses and errors on the network level.
 * When the responses come back successfully, the convenience wrappers allow callbacks for relevant scenarios.
 */
export const webhookApiBase : cloudApiBase_cloudModule = {
  _networkErrorHandler: (err) => {},

  _post: function(options) {
    return request(options, 'POST',   defaultHeaders, _getId(options.endPoint, WebhookStore), WebhookStore.api_key);
  },
  _get: function(options) {
    return request(options, 'GET',    defaultHeaders, _getId(options.endPoint, WebhookStore), WebhookStore.api_key);
  },
  _delete: function(options) {
    return request(options, 'DELETE', defaultHeaders, _getId(options.endPoint, WebhookStore), WebhookStore.api_key);
  },
  _put: function(options) {
    return request(options, 'PUT',    defaultHeaders, _getId(options.endPoint, WebhookStore), WebhookStore.api_key);
  },
  _head: function(options) {
    return request(options, 'HEAD',   defaultHeaders, _getId(options.endPoint, WebhookStore), WebhookStore.api_key);
  },

  /**
   * This method will check the return type error code for 200 or 204 and unpack the data from the response.
   * @param {string} reqType
   * @param {string} endpoint
   * @param {requestOptions} options
   * @param {requestType} type
   * @returns {Promise<any>}
   * @private
   */
  _setupRequest: function(reqType : string, endpoint : string, options : requestOptions = {}, type : requestType = 'query') {
    let promiseBody = {endPoint: endpoint, data: options.data, type:type, options: options};
    let promise;
    switch (reqType) {
      case 'POST':
        promise = webhookApiBase._post(promiseBody);
        break;
      case 'GET':
        promise = webhookApiBase._get(promiseBody);
        break;
      case 'PUT':
        promise = webhookApiBase._put(promiseBody);
        break;
      case 'DELETE':
        promise = webhookApiBase._delete(promiseBody);
        break;
      case 'HEAD':
        promise = webhookApiBase._head(promiseBody);
        break;
      default:
        log.error("UNKNOWN TYPE:", reqType);
        return;
    }
    return webhookApiBase._finalizeRequest(promise, options, endpoint, promiseBody);
  },

  _finalizeRequest: function(promise, options, endpoint?, promiseBody?) {
    return new Promise((resolve, reject) => {
      let startTime = new Date().valueOf();
      promise
        .then((reply) => {
          if (reply.status === 200 || reply.status === 204)
            resolve(reply.data);
          else
            this.__debugReject(reply, reject, [promise, options, endpoint, promiseBody]);
        })
        .catch((error) => {
          console.trace(error);
          this._handleNetworkError(error, options, endpoint, promiseBody, reject, startTime);
        })
    });
  },

  // END USER API
  // These methods have all the endpoints embedded in them.

  setNetworkErrorHandler: function(handler)     : any  { this._networkErrorHandler = handler },
  _handleNetworkError: function(error: any, options: any, endpoint: any, promiseBody: any, reject: any, startTime: any) {},
  __debugReject: function(reply, reject, debugOptions) {
    log.error("ERROR: HTML ERROR IN API:", reply, debugOptions);
    reject(reply);
  }
};



function _getId(url, obj) : string {
  let usersLocation = url.indexOf('users');
  if (usersLocation !== -1 && usersLocation < 3)
    return obj.userId;

  let devicesLocation = url.indexOf('listeners');
  if (devicesLocation !== -1 && devicesLocation < 3)
    return obj.listenerId;
}

