// todo: add documentation
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlePackets = require('./BlePackets');
const BluenetTypes = require("./BluenetTypes");
const Util = require('./Util');
class ControlPacketsGenerator {
    static getSwitchStatePacket(switchState) {
        let convertedSwitchState = Util.Util.bound0_100(switchState);
        return new BlePackets.ControlPacket(BluenetTypes.ControlType.SWITCH).loadUInt8(convertedSwitchState).getPacket();
    }
    static getDisconnectPacket() {
        return new BlePackets.ControlPacket(BluenetTypes.ControlType.DISCONNECT).getPacket();
    }
}
exports.ControlPacketsGenerator = ControlPacketsGenerator;