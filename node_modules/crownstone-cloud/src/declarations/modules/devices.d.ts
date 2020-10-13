interface devices_cloudModule {
    getDevices: () => Promise<any>;
    createDevice: (data: any) => Promise<any>;
    updateDevice: (deviceId: string, data: any) => Promise<any>;
    sendTestNotification: () => Promise<any>;
    deleteDevice: (deviceId: string) => Promise<any>;
    deleteAllDevices: () => Promise<any>;
    getTrackingNumberInSphere: (cloudSphereId: string) => Promise<any>;
    inSphere: (cloudSphereId: string) => Promise<any>;
    inLocation: (cloudSphereId: string, cloudLocationId: string) => Promise<any>;
    exitLocation: (cloudSphereId: string, cloudLocationId: string) => Promise<any>;
    exitSphere: (cloudSphereId: string) => Promise<any>;
}
