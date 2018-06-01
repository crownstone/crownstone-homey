"use strict";
/**
 * Created by alex on 25/08/16.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appliances = {
    getAppliancesInSphere: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/ownedAppliances', background);
    },
    createAppliance: function (data, background = true) {
        return this._setupRequest('POST', '/Spheres/{id}/ownedAppliances', { data: data, background: background }, 'body');
    },
    updateAppliance: function (cloudApplianceId, data, background = true) {
        return this._setupRequest('PUT', '/Spheres/{id}/ownedAppliances/' + cloudApplianceId, { background: background, data: data }, 'body');
    },
    deleteAppliance: function (cloudApplianceId) {
        if (cloudApplianceId) {
            return this._setupRequest('DELETE', '/Spheres/{id}/ownedAppliances/' + cloudApplianceId);
        }
    },
};
//# sourceMappingURL=appliances.js.map