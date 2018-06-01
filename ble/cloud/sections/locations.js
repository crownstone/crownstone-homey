"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locations = {
    getLocations: function (background = true) {
        return this._setupRequest('GET', '/Spheres/{id}/ownedLocations', { background: background, data: { filter: { "include": "presentPeople" } } });
    },
    createLocation: function (data, background = true) {
        return this._setupRequest('POST', '/Spheres/{id}/ownedLocations', { data: data, background: background }, 'body');
    },
    updateLocation: function (cloudLocationId, data, background = true) {
        return this._setupRequest('PUT', '/Spheres/{id}/ownedLocations/' + cloudLocationId, { background: background, data: data }, 'body');
    },
    deleteLocation: function (cloudLocationId) {
        return this._setupRequest('DELETE', '/Spheres/{id}/ownedLocations/' + cloudLocationId);
    },
    downloadLocationPicture: function (toPath) {
        return this._download({ endPoint: '/Locations/{id}/image' }, toPath);
    },
    uploadLocationPicture: function (file) {
        return this._uploadImage({ endPoint: '/Locations/{id}/image', path: file, type: 'body' });
    },
    deleteLocationPicture: function () {
        return this._setupRequest('DELETE', '/Locations/{id}/image/');
    },
};
//# sourceMappingURL=locations.js.map