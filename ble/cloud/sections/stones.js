"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stones = {
    /**
     * Create a crownstone in the cloud so the major and minor can be generated
     * @param data
     * @param background
     * @returns {*}
     */
    createStone: function (data, background = true) {
        return this._setupRequest('POST', '/Spheres/{id}/ownedStones/', { data: data, background: background }, 'body');
    },
    /**
     * Update a crownstone in the cloud
     * @param cloudStoneId
     * @param data
     * @param background
     * @returns {*}
     */
    updateStone: function (cloudStoneId, data, background = true) {
        return this._setupRequest('PUT', '/Spheres/{id}/ownedStones/' + cloudStoneId, { background: background, data: data }, 'body');
    },
    /**
     * Update a crownstone in the cloud
     * @param switchState
     * @param background
     * @returns {*}
     */
    updateStoneSwitchState: function (switchState, background = true) {
        return this._setupRequest('POST', '/Stones/{id}/currentSwitchState?switchState=' + switchState, { background: background }, 'body');
    },
    /**
     * Update a current energy usage
     * @param data
     * @param background
     * @returns {*}
     */
    updatePowerUsage: function (data, background = true) {
        return this._setupRequest('POST', '/Stones/{id}/currentPowerUsage/', { background: background, data: data }, 'body');
    },
    /**
     * Update a current energy usage
     * @param data
     * @param background
     * @returns {*}
     */
    updateBatchPowerUsage: function (data, background = true) {
        return this._setupRequest('POST', '/Stones/{id}/batchPowerUsage/', { background: background, data: data }, 'body');
    },
    /**
     * Update the link from a crownstone to a room.
     * @param cloudLocationId
     * @param cloudSphereId
     * @param updatedAt
     * @param background
     * @param doNotSetUpdatedTimes
     * @returns {*}
     */
    updateStoneLocationLink: function (cloudLocationId, cloudSphereId, updatedAt, background = true, doNotSetUpdatedTimes = false) {
        return this._setupRequest('PUT', '/Stones/{id}/locations/rel/' + cloudLocationId, { background: background })
            .then(() => {
            if (doNotSetUpdatedTimes !== true) {
                let promises = [];
                promises.push(this.forSphere(cloudSphereId).updateStone(this._stoneId, { locationId: cloudLocationId, updatedAt: updatedAt }));
                promises.push(this.forSphere(cloudSphereId).updateLocation(cloudLocationId, { updatedAt: updatedAt }));
                // we set the updatedAt time in the cloud since changing the links does not update the time there
                return Promise.all(promises);
            }
        });
    },
    /**
     * Delete the link from a crownstone to a room.
     * @param cloudLocationId
     * @param cloudSphereId
     * @param updatedAt
     * @param background
     * @returns {*}
     */
    deleteStoneLocationLink: function (cloudLocationId, cloudSphereId, updatedAt, background = true) {
        return this._setupRequest('DELETE', '/Stones/{id}/locations/rel/' + cloudLocationId, { background: background })
            .then(() => {
            let promises = [];
            promises.push(this.forSphere(cloudSphereId).updateStone(this._stoneId, { updatedAt: updatedAt }));
            promises.push(this.forSphere(cloudSphereId).updateLocation(cloudLocationId, { updatedAt: updatedAt }));
            // we set the updatedAt time in the cloud since changing the links does not update the time there
            return Promise.all(promises);
        });
    },
    /**
     * request the data of all crownstones in this sphere
     * @returns {*}
     */
    getStonesInSphere: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/ownedStones', { background: background, data: { filter: { "include": ["schedules", "locations"] } } });
    },
    /**
     * request the data from this crownstone in the cloud
     * @param cloudStoneId  database id of crownstone
     * @returns {*}
     */
    getStone: function (cloudStoneId) {
        return this._setupRequest('GET', '/Stones/' + cloudStoneId);
    },
    /**
     * search for crownstone with this mac address
     * @param address  mac address
     * @returns {*}
     */
    findStone: function (address) {
        return this._setupRequest('GET', '/Spheres/{id}/ownedStones/', { data: { filter: { where: { address: address } } } }, 'query');
    },
    /**
     * Delete the data from this crownstone in the cloud in case of a failed setup or factory reset.
     * stoneId  database id of crownstone
     * @returns {*}
     */
    deleteStone: function (cloudStoneId) {
        if (cloudStoneId) {
            return this._setupRequest('DELETE', '/Spheres/{id}/ownedStones/' + cloudStoneId);
        }
    },
    sendStoneDiagnosticInfo: function (data, background = true) {
        return this._setupRequest('POST', '/Stones/{id}/diagnostics', { background: background, data: data }, 'body');
    }
};
//# sourceMappingURL=stones.js.map