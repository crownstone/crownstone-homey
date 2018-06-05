export declare const fingerprints: {
    createFingerprint: (cloudLocationId: any, data: any, background: true) => any;
    getFingerprintsInLocations: (cloudLocationIdArray: any, background?: boolean) => any;
    getFingerprints: (fingerprintIdArray: any, background?: boolean) => any;
    updateFingerprint: (fingerprintId: any, data: any, background?: boolean) => any;
    getMatchingFingerprintsInLocations: (cloudLocationIdArray: any, background?: boolean) => any;
    linkFingerprints: (fingerprintIdArray: any, background?: boolean) => any;
    getFingerprintUpdateTimes: (fingerprintIdArray: any, background?: boolean) => any;
};
