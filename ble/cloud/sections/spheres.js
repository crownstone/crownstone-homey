"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spheres = {
    updateSphere: function (cloudSphereId, data, background = true) {
        return this._setupRequest('PUT', '/Spheres/' + cloudSphereId, { background: background, data: data }, 'body');
    },
    inviteUser: function (email, permission = "") {
        permission = permission.toLowerCase();
        switch (permission) {
            case 'admin':
                return this._setupRequest('PUT', '/Spheres/{id}/admins', { data: { email: email } });
            case 'member':
                return this._setupRequest('PUT', '/Spheres/{id}/members', { data: { email: email } });
            case 'guest':
                return this._setupRequest('PUT', '/Spheres/{id}/guests', { data: { email: email } });
            default:
                return new Promise((resolve, reject) => {
                    reject(new Error('Invalid Permission: "' + permission + '"'));
                });
        }
    },
    getPendingInvites: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/pendingInvites', { background: background });
    },
    resendInvite: function (email, background = false) {
        return this._setupRequest('GET', '/Spheres/{id}/resendInvite', { data: { email: email }, background: background });
    },
    revokeInvite: function (email, background = false) {
        return this._setupRequest('GET', '/Spheres/{id}/removeInvite', { data: { email: email }, background: background });
    },
    /**
     *
     * @returns {*}
     */
    getSpheres: function (background = true) {
        return this._setupRequest('GET', '/users/{id}/spheres', { background: background });
    },
    getUsers: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/users', { background: background });
    },
    getAdmins: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/admins', { background: background });
    },
    getMembers: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/members', { background: background });
    },
    getGuests: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/guests', { background: background });
    },
    /**
     * @param data
     * @param background
     */
    createSphere: function (data, background = true) {
        return this._setupRequest('POST', 'users/{id}/spheres', { data: data, background: background }, 'body');
    },
    changeSphereName: function (sphereName) {
        return this._setupRequest('PUT', '/Spheres/{id}', { data: { name: sphereName } }, 'body');
    },
    changeUserAccess: function (email, accessLevel, background = false) {
        return this._setupRequest('PUT', '/Spheres/{id}/role', { data: { email: email, role: accessLevel }, background: background }, 'query');
    },
    deleteUserFromSphere: function (userId) {
        // userId is the same in the cloud as it is cloudly
        return this._setupRequest('DELETE', '/Spheres/{id}/users/rel/' + userId);
    },
    deleteSphere: function () {
        let sphereId = this._sphereId;
        let promises = [];
        let applianceData = [];
        let stoneData = [];
        let locationData = [];
        promises.push(this.getStonesInSphere()
            .then((stones) => {
            stoneData = stones;
        }).catch((err) => { }));
        // for every sphere we get the appliances
        promises.push(this.getAppliancesInSphere()
            .then((appliances) => {
            applianceData = appliances;
        }).catch((err) => { }));
        // for every sphere, we get the locations
        promises.push(this.getLocations()
            .then((locations) => {
            locationData = locations;
        }).catch((err) => { }));
        return Promise.all(promises)
            .then(() => {
            let deletePromises = [];
            applianceData.forEach((appliance) => {
                deletePromises.push(this.forSphere(this._sphereId).deleteAppliance(appliance.id));
            });
            stoneData.forEach((stone) => {
                deletePromises.push(this.forSphere(this._sphereId).deleteStone(stone.id));
            });
            locationData.forEach((location) => {
                deletePromises.push(this.forSphere(this._sphereId).deleteLocation(location.id));
            });
            return Promise.all(deletePromises);
        })
            .then(() => {
            return this._deleteSphere(sphereId);
        });
    },
    _deleteSphere: function (cloudSphereId) {
        if (cloudSphereId) {
            return this._setupRequest('DELETE', 'Spheres/' + cloudSphereId);
        }
    },
    leaveSphere: function (cloudSphereId) {
        if (cloudSphereId) {
            return this._setupRequest('DELETE', 'users/{id}/spheres/rel/' + cloudSphereId);
        }
    }
};
//# sourceMappingURL=spheres.js.map