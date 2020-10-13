interface fingerprints_cloudModule {
    createFingerprint: (cloudLocationId: string, data: any) => Promise<any>;
    getFingerprintsInLocations: (cloudLocationIdArray: any) => Promise<any>;
    getFingerprints: (fingerprintIdArray: any) => Promise<any>;
    updateFingerprint: (fingerprintId: string, data: any) => Promise<any>;
    getMatchingFingerprintsInLocations: (cloudLocationIdArray: any) => Promise<any>;
    linkFingerprints: (fingerprintIdArray: any) => Promise<any>;
    getFingerprintUpdateTimes: (fingerprintIdArray: any) => Promise<any>;
}
