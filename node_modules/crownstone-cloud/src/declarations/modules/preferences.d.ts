interface preferences_cloudModule {
    getPreferences: () => Promise<any>;
    createPreference: (data: any) => Promise<any>;
    updatePreference: (preferenceCloudId: string, data: any) => Promise<any>;
    deletePreference: (preferenceCloudId: string) => Promise<any>;
}
