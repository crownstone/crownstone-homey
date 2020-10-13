import {ServiceData} from "../../ServiceData";
import {reconstructTimestamp} from "../../../util/Timestamp";
import { Util } from "../../../util/Util";

export function parseOpCode3_type1(serviceData : ServiceData, data : Buffer) {
  if (data.length == 16) {
    // dataType = data[0]
    serviceData.errorMode = true;

    serviceData.crownstoneId = data.readUInt8(1);
    serviceData.errorsBitmask = data.readUInt32LE(2);

    serviceData.errorTimestamp = data.readUInt32LE(6);

    serviceData.flagsBitmask = data.readUInt8(10);
    // bitmask states
    let bitmaskArray = Util.getBitMaskUInt8(serviceData.flagsBitmask);

    serviceData.dimmerReady = bitmaskArray[0];
    serviceData.dimmingAllowed = bitmaskArray[1];
    serviceData.hasError = bitmaskArray[2];
    serviceData.switchLocked = bitmaskArray[3];
    serviceData.timeIsSet = bitmaskArray[4];
    serviceData.switchCraftEnabled = bitmaskArray[5];

    serviceData.temperature = data.readUInt8(11);

    serviceData.partialTimestamp = data.readUInt16LE(12);
    serviceData.uniqueIdentifier = serviceData.partialTimestamp;


    if (serviceData.timeIsSet) {
      serviceData.timestamp = reconstructTimestamp(new Date().valueOf() * 0.001, serviceData.partialTimestamp)
    }
    else {
      serviceData.timestamp = serviceData.partialTimestamp; // this is now a counter
    }

    let realPower = data.readInt16LE(14);
    serviceData.powerUsageReal = realPower / 8;

    // this packets has no validation
    serviceData.validation = 0
  }
}