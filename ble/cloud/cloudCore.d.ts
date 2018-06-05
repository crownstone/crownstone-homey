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
export declare function request(options: object, method: string, headers: object, id: string, accessToken: string, doNotStringify?: boolean): Promise<{}>;
