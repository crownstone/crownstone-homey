interface locations_cloudModule {
    getLocations: () => Promise<any>;
    createLocation: (data: any) => Promise<any>;
    updateLocation: (cloudLocationId: string, data: any) => Promise<any>;
    updateLocationPosition: (data: any) => Promise<any>;
    deleteLocation: (cloudLocationId: string) => Promise<any>;
    deleteLocationPicture: () => Promise<any>;
}
