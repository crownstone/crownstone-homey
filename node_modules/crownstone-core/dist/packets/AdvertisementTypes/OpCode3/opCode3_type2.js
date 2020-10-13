"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opCode3_type0_1 = require("./opCode3_type0");
function parseOpCode3_type2(serviceData, data) {
    if (data.length == 16) {
        opCode3_type0_1.parseOpCode3_type0(serviceData, data);
        // apply differences between type 0 and type 2
        serviceData.stateOfExternalCrownstone = true;
        serviceData.rssiOfExternalCrownstone = data.readUInt8(14);
    }
}
exports.parseOpCode3_type2 = parseOpCode3_type2;
//# sourceMappingURL=opCode3_type2.js.map