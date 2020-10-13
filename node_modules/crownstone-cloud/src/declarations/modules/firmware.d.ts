interface firmware_cloudModule {
    getFirmwareDetails: (version: any, hardwareVersion: any) => Promise<any>;
    getLatestAvailableFirmware: () => Promise<any>;
}
