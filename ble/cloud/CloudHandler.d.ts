export declare class CloudHandler {
    token: any;
    userId: any;
    constructor();
    login(userData: any): Promise<void>;
    getKeys(sphereId: any): any;
    _login(userData: any): Promise<{}>;
}
