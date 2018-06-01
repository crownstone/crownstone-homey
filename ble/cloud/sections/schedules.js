"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedules = {
    createSchedule: function (data, background = true) {
        return this._setupRequest('POST', '/Stones/{id}/schedules/', { data: data, background: background }, 'body');
    },
    getSchedule: function (cloudScheduleId, background = true) {
        return this._setupRequest('GET', '/Stones/{id}/schedules/' + cloudScheduleId, { background: background });
    },
    /**
     * request the data of all crownstones in this sphere
     * @returns {*}
     */
    getSchedules: function (background = true) {
        return this._setupRequest('GET', '/Stones/{id}/schedules', { background: background });
    },
    /**
     * request the data of all crownstones in this sphere
     * @returns {*}
     */
    getScheduleWithIndex: function (index, background = true) {
        return this._setupRequest('GET', '/Stones/{id}/schedules', { background: background, data: { filter: { where: { scheduleEntryIndex: index } } } });
    },
    updateSchedule: function (cloudScheduleId, data, background = true) {
        return this._setupRequest('PUT', '/Stones/{id}/schedules/' + cloudScheduleId, { data: data, background: background }, 'body');
    },
    deleteSchedule: function (cloudScheduleId, background = true) {
        return this._setupRequest('DELETE', '/Stones/{id}/schedules/' + cloudScheduleId, { background: background });
    },
};
//# sourceMappingURL=schedules.js.map