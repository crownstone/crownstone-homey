interface defaultHeaders {
    'Accept': string;
    'Content-Type': string;
}
interface uploadHeaders {
    'Accept': string;
    'Content-Type': string;
}
interface requestOptions {
    data?: any;
    noAccessToken?: boolean;
}
/**
 * The rest API is designed to maintain the REST endpoints and to handle responses and errors on the network level.
 * When the responses come back successfully, the convenience wrappers allow callbacks for relevant scenarios.
 */
interface cloudApiBase_cloudModule {
    _networkErrorHandler: (err: any) => void;
    _post: (options: any) => Promise<any>;
    _get: (options: any) => Promise<any>;
    _delete: (options: any) => Promise<any>;
    _put: (options: any) => Promise<any>;
    _head: (options: any) => Promise<any>;
    _handleNetworkError: (error: any, options: any, endpoint: any, promiseBody: any, reject: any, startTime: any) => void;
    /**
     * This method will check the return type error code for 200 or 204 and unpack the data from the response.
     * @param {string} reqType
     * @param {string} endpoint
     * @param {requestOptions} options
     * @param {requestType} type
     * @returns {Promise<any>}
     * @private
     */
    _setupRequest: (reqType: string, endpoint: string, options?: requestOptions, type?: requestType) => Promise<any>;
    _finalizeRequest: (promise: any, options: any, endpoint?: any, promiseBody?: any) => Promise<any>;
    setNetworkErrorHandler: (handler: any) => any;
    __debugReject: (reply: any, reject: any, debugOptions: any) => void;
}
