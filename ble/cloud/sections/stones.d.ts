export declare const stones: {
    createStone: (data: any, background?: boolean) => any;
    updateStone: (cloudStoneId: any, data: any, background?: boolean) => any;
    updateStoneSwitchState: (switchState: any, background?: boolean) => any;
    updatePowerUsage: (data: any, background?: boolean) => any;
    updateBatchPowerUsage: (data: any[], background?: boolean) => any;
    updateStoneLocationLink: (cloudLocationId: any, cloudSphereId: any, updatedAt: any, background?: boolean, doNotSetUpdatedTimes?: boolean) => any;
    deleteStoneLocationLink: (cloudLocationId: any, cloudSphereId: any, updatedAt: any, background?: boolean) => any;
    getStonesInSphere: (background?: boolean) => any;
    getStone: (cloudStoneId: any) => any;
    findStone: (address: any) => any;
    deleteStone: (cloudStoneId: any) => any;
    sendStoneDiagnosticInfo: (data: any, background?: boolean) => any;
};
