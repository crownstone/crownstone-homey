"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opCode3_type1_1 = require("./opCode3_type1");
function parseOpCode3_type3(serviceData, data) {
    if (data.length == 16) {
        opCode3_type1_1.parseOpCode3_type1(serviceData, data);
        // apply differences between type 1 and type 4
        serviceData.stateOfExternalCrownstone = true;
        serviceData.powerUsageReal = 0;
        serviceData.rssiOfExternalCrownstone = data.readUInt8(14);
        serviceData.validation = data.readUInt8(15);
    }
}
exports.parseOpCode3_type3 = parseOpCode3_type3;
//# sourceMappingURL=opCode3_type3.js.map