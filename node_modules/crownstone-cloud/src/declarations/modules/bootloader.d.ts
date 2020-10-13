interface bootloader_cloudModule {
    getBootloaderDetails: (version: any, hardwareVersion: any) => Promise<any>;
    getLatestAvailableBootloader: () => Promise<any>;
}
