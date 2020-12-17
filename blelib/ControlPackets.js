// todo: add BlePackets, BluenetTypes, Util
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlePackets = require('./BlePackets');
//const BluenetTypes = require("./BluenetTypes");
const Util = require('./Util');
let bluenetTypeSWITCH = 0;
class ControlPacketsGenerator {
    static getSwitchStatePacket(switchState) {
        let convertedSwitchState = Util.Util.bound0_100(switchState);
        return new BlePackets.ControlPacket(bluenetTypeSWITCH).loadUInt8(convertedSwitchState).getPacket();
    }
}
exports.ControlPacketsGenerator = ControlPacketsGenerator;