import { requestOptions, requestType } from "../../types/declarations";
export declare const defaultHeaders: {
    'Accept': string;
    'Content-Type': string;
};
export declare const uploadHeaders: {
    'Accept': string;
    'Content-Type': string;
};
/**
 * The cloud API is designed to maintain the REST endpoints and to handle responses and errors on the network level.
 * When the responses come back successfully, the convenience wrappers allow callbacks for relevant scenarios.
 */
export declare const cloudApiBase: {
    _accessToken: any;
    _userId: any;
    _deviceId: any;
    _installationId: any;
    _eventId: any;
    _sphereId: any;
    _locationId: any;
    _stoneId: any;
    _applianceId: any;
    _messageId: any;
    _networkErrorHandler: () => void;
    _post: (options: any) => Promise<{}>;
    _get: (options: any) => Promise<{}>;
    _delete: (options: any) => Promise<{}>;
    _put: (options: any) => Promise<{}>;
    _head: (options: any) => Promise<{}>;
    _handleNetworkError: (error: any, options: any, endpoint: any, promiseBody: any, reject: any) => void;
    _setupRequest: (reqType: string, endpoint: string, options?: requestOptions, type?: requestType) => any;
    _finalizeRequest: (promise: any, options: any, endpoint: any, promiseBody: any) => Promise<{}>;
    setNetworkErrorHandler: (handler: any) => void;
    setAccess: (accessToken: any) => any;
    setUserId: (userId: any) => any;
    forUser: (userId: any) => any;
    forDevice: (deviceId: any) => any;
    forInstallation: (installationId: any) => any;
    forStone: (cloudStoneId: any) => any;
    forSphere: (cloudSphereId: any) => any;
    forLocation: (cloudLocationId: any) => any;
    forAppliance: (cloudApplianceId: any) => any;
    forMessage: (cloudMessageId: any) => any;
};
