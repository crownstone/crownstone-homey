interface stones_cloudModule {
    /**
     * Create a crownstone in the rest so the major and minor can be generated
     * @param data

     * @returns {*}
     */
    createStone: (data: any) => Promise<any>;
    /**
     * Update a crownstone in the rest
     * @param localStoneId
     * @param data

     * @returns {*}
     */
    updateStone: (cloudStoneId: string, data: any) => Promise<any>;
    /**
     * Update a crownstone in the rest
     * @param switchState

     * @returns {*}
     */
    updateStoneSwitchState: (switchState: any) => Promise<any>;
    /**
     * Update a current energy usage
     * @param data

     * @returns {*}
     */
    updatePowerUsage: (data: any) => Promise<any>;
    /**
     * Update a current energy usage
     * @param data

     * @returns {*}
     */
    updateBatchPowerUsage: (data: any[]) => Promise<any>;
    /**
     * !
     * !
     * ! ------------- DEPRECATED -----------------
     * !
     * !
     * Update the link from a crownstone to a room.
     * @param localLocationId
     * @param localSphereId
     * @param updatedAt

     * @param doNotSetUpdatedTimes
     * @returns {*}
     */
    updateStoneLocationLink: (cloudLocationId: string, localSphereId: string, updatedAt: any, doNotSetUpdatedTimes?: boolean) => Promise<any[]>;
    /**
     * !
     * !
     * ! ------------- DEPRECATED -----------------
     * !
     * !
     * Delete the link from a crownstone to a room.
     * @param localLocationId
     * @param localSphereId
     * @param updatedAt

     * @returns {*}
     */
    deleteStoneLocationLink: (cloudLocationId: string, localSphereId: string, updatedAt: any) => Promise<any[]>;
    /**
     * request the data of all crownstones in this sphere
     * @returns {*}
     */
    getStonesInSphere: () => Promise<any>;
    /**
     * request the data from this crownstone in the rest
     * @param localStoneId  database id of crownstone
     * @returns {*}
     */
    getStone: (cloudStoneId: string) => Promise<any>;
    /**
     * search for crownstone with this mac address
     * @param address  mac address
     * @returns {*}
     */
    findStone: (address: any) => Promise<any>;
    /**
     * Delete the data from this crownstone in the rest in case of a failed setup or factory reset.
     * stoneId  database id of crownstone
     * @returns {*}
     */
    deleteStone: (cloudStoneId: string) => Promise<any>;
    sendStoneDiagnosticInfo: (data: any) => Promise<any>;

    getAllStoneData: () => Promise<any>
}
