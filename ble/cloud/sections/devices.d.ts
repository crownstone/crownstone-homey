export declare const devices: {
    getDevices: (background: true) => any;
    createDevice: (data: any, background?: boolean) => any;
    updateDevice: (deviceId: any, data: any, background?: boolean) => any;
    updateDeviceLocation: (cloudLocationId: any, background?: boolean) => any;
    updateDeviceSphere: (cloudSphereId: any, background?: boolean) => any;
    deleteDevice: (deviceId: any) => any;
    deleteAllDevices: () => any;
};
