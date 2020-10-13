interface installations_cloudModule {
    getInstallations: (options?: any) => Promise<any>;
    createInstallation: (appName: any, data: any) => Promise<any>;
    updateInstallation: (installationId: string, data: any) => Promise<any>;
    getInstallation: (installationId: string) => Promise<any>;
    deleteInstallation: (installationId: string) => Promise<any>;
}
