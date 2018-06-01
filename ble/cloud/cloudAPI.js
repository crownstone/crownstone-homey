'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../util/Util");
const appliances_1 = require("./sections/appliances");
const cloudApiBase_1 = require("./sections/cloudApiBase");
const devices_1 = require("./sections/devices");
const fingerprints_1 = require("./sections/fingerprints");
const locations_1 = require("./sections/locations");
const messages_1 = require("./sections/messages");
const stones_1 = require("./sections/stones");
const spheres_1 = require("./sections/spheres");
const schedules_1 = require("./sections/schedules");
const user_1 = require("./sections/user");
function combineSections() {
    let result = {};
    Util_1.Util.mixin(result, cloudApiBase_1.cloudApiBase);
    // mixin all modules.
    Util_1.Util.mixin(result, appliances_1.appliances);
    Util_1.Util.mixin(result, devices_1.devices);
    Util_1.Util.mixin(result, fingerprints_1.fingerprints);
    Util_1.Util.mixin(result, locations_1.locations);
    Util_1.Util.mixin(result, messages_1.messages);
    Util_1.Util.mixin(result, schedules_1.schedules);
    Util_1.Util.mixin(result, spheres_1.spheres);
    Util_1.Util.mixin(result, stones_1.stones);
    Util_1.Util.mixin(result, user_1.user);
    return result;
}
/**
 * This adds all sections into the CLOUD
 */
exports.CLOUD = combineSections();
//# sourceMappingURL=cloudAPI.js.map