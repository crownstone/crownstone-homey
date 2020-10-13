import {Util} from "../util/Util";

import { prepareEndpointAndBody } from './cloudUtil'
import { defaultHeaders } from './sections/cloudApiBase'
import fetch from 'cross-fetch';
import {CLOUD_ADDRESS} from "../config";
import {Logger} from "../Logger";

const log = Logger(__filename);
/**
 *
 * This method communicates with the rest services.
 *
 * @param options        // { endPoint: '/users/', data: JSON, type:'body'/'query' }
 * @param method
 * @param headers
 * @param id
 * @param accessToken
 * @param doNotStringify
 */
export function request(
  options : object,
  method : string,
  headers : object = defaultHeaders,
  id : string,
  accessToken : string,
  doNotStringify? : boolean) {
  // append _accessToken, data that goes into the query and insert ids
  let { endPoint, body } = prepareEndpointAndBody(options, id, accessToken, doNotStringify);

  // setup the request configuration
  let requestConfig = { method, headers, body };

  // two semi-global variables in this promise:
  let STATUS = 0;

  // parse the reply
  let handleInitialReply = (response) => {
    STATUS = response.status;
    if (response &&
      response.headers &&
      (
      response.headers.map &&
      response.headers.map['content-type'] &&
      response.headers.map['content-type'].length > 0
      ) || response.headers.get && response.headers.get('content-type')) {
      // since RN 0.57, the response seems to have changed from what it was before. Presumably due to changes in Fetch.
      // This could also be part of our rest changes, this will work for both types of data now.
      let contentType = response.headers.map && response.headers.map['content-type'] || response.headers.get("content-type");

      if (!Array.isArray(contentType) && typeof contentType === 'string') {
        contentType = contentType.split("; ");
      }

      if (response && response._bodyBlob && response._bodyBlob.size === 0) {
        return '';
      }
      // this part: responseHeaders[0].substr(0,16) === 'application/json' is legacy. It's ugly and imprecise, but we will keep it for legacy for now.
      else if (contentType[0].substr(0,16) === 'application/json' || contentType.indexOf("application/json") !== -1) {
        return response.json(); // this is a promise
      }
      else {
        return response.text();
      }
    }
    return response.text(); // this is a promise
  };

  let logToken = Util.getToken();

  let url = endPoint;
  if (endPoint.substr(0,4) !== 'http') {
    url = CLOUD_ADDRESS + endPoint;
  }

  log.info(method,"requesting from URL:", url, "config:", requestConfig, logToken);

  // the actual request
  return new Promise((resolve, reject) => {
    // this will eliminate all rest requests.
    let stopRequest = false;
    let finishedRequest = false;
    // add a timeout for the fetching of data.
    let fallbackTimeout = setTimeout(() => {
        stopRequest = true;
        if (finishedRequest !== true)
          reject('Network request to ' + CLOUD_ADDRESS + endPoint + ' failed')
      },
    20000);
    fetch(url, requestConfig as any)
      .catch((connectionError) => {
        if (stopRequest === false) {
          reject('Network request to ' + CLOUD_ADDRESS + endPoint + ' failed');
        }
      })
      .then((response) => {
        if (stopRequest === false) {
          clearTimeout(fallbackTimeout);
          return handleInitialReply(response);
        }
      })
      .catch((parseError) => {
        // TODO: cleanly fix this
        // LOGe.rest("ERROR DURING PARSING:", parseError, "from request to:", CLOUD_ADDRESS + endPoint, "using config:", requestConfig);
        return '';
      })
      .then((parsedResponse) => {
        if (stopRequest === false) {
          if (STATUS >= 400) { log.warn("REPLY from", endPoint, " failed", STATUS, logToken); }
          else               { log.info("REPLY from", endPoint, " SUCCESSFUL", STATUS, logToken); }

          log.debug("REPLY from", endPoint, " with options: ", requestConfig, " is: ", {status: STATUS, data: parsedResponse}, logToken);
          finishedRequest = true;
          resolve({status: STATUS, data: parsedResponse});
        }
      })
      .catch((err) => {
        if (stopRequest === false) {
          finishedRequest = true;
          reject(err);
        }
      })
  });
}
