"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../util/logging/Log");
const cloudUtil_1 = require("./cloudUtil");
const cloudApiBase_1 = require("./sections/cloudApiBase");
const Util_1 = require("../util/Util");
const node_fetch_1 = __importDefault(require("node-fetch"));
const CLOUD_ADDRESS = 'https://my.crownstone.rocks/api/';
const NETWORK_REQUEST_TIMEOUT = 15000;
/**
 *
 * This method communicates with the cloud services.
 *
 * @param options        // { endPoint: '/users/', data: JSON, type:'body'/'query' }
 * @param method
 * @param headers
 * @param id
 * @param accessToken
 * @param doNotStringify
 */
function request(options, method, headers = cloudApiBase_1.defaultHeaders, id, accessToken, doNotStringify) {
    // append _accessToken, data that goes into the query and insert ids
    let { endPoint, body } = cloudUtil_1.prepareEndpointAndBody(options, id, accessToken, doNotStringify);
    // setup the request configuration
    let requestConfig = { method, headers, body };
    // two semi-global variables in this promise:
    let STATUS = 0;
    // parse the reply
    let handleInitialReply = (response) => {
        STATUS = response.status;
        return response.json(); // this is a promise
    };
    let logToken = Util_1.Util.getToken();
    Log_1.LOG.cloud(method, "requesting from URL:", CLOUD_ADDRESS + endPoint, "config:", requestConfig, logToken);
    // the actual request
    return new Promise((resolve, reject) => {
        // this will eliminate all cloud requests.
        let stopRequest = false;
        let finishedRequest = false;
        // add a timeout for the fetching of data.
        let timeoutId = setTimeout(() => {
            stopRequest = true;
            if (finishedRequest !== true)
                reject('Network request to ' + CLOUD_ADDRESS + endPoint + ' failed');
        }, NETWORK_REQUEST_TIMEOUT);
        node_fetch_1.default(CLOUD_ADDRESS + endPoint, requestConfig)
            .catch((connectionError) => {
            if (stopRequest === false) {
                reject('Network request to ' + CLOUD_ADDRESS + endPoint + ' failed');
            }
        })
            .then((response) => {
            if (stopRequest === false) {
                clearTimeout(timeoutId);
                return handleInitialReply(response);
            }
        })
            .catch((parseError) => {
            // TODO: cleanly fix this
            // LOG.error("ERROR DURING PARSING:", parseError, "from request to:", CLOUD_ADDRESS + endPoint, "using config:", requestConfig);
            return '';
        })
            .then((parsedResponse) => {
            if (stopRequest === false) {
                Log_1.LOG.cloud("REPLY from", endPoint, " with options: ", requestConfig, " is: ", { status: STATUS, data: parsedResponse }, logToken);
                finishedRequest = true;
                resolve({ status: STATUS, data: parsedResponse });
            }
        })
            .catch((err) => {
            if (stopRequest === false) {
                finishedRequest = true;
                reject(err);
            }
        });
    });
}
exports.request = request;
//# sourceMappingURL=cloudCore.js.map