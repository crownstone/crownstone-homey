import {ServiceData} from "../../ServiceData";
import {reconstructTimestamp} from "../../../util/Timestamp";
import { Util } from "../../../util/Util";
import {DataStepper} from "../../../index";

export function parseOpCode7_type4(serviceData : ServiceData, data : Buffer) {
  if (data.length == 16) {

    let payload = new DataStepper(data);

    serviceData.stateOfExternalCrownstone = false

    payload.skip() // first byte is the datatype.
    serviceData.crownstoneId         = payload.getUInt8();
    serviceData.switchState          = payload.getUInt8();
    serviceData.flagsBitmask         = payload.getUInt8();
    serviceData.behaviourMasterHash  = payload.getUInt16();
    payload.skip(6);
    serviceData.partialTimestamp     = payload.getUInt16();
    payload.skip();
    serviceData.validation           = payload.getUInt8();

    serviceData.stateOfExternalCrownstone = false;

    // bitmask states
    let bitmaskArray = Util.getBitMaskUInt8(serviceData.flagsBitmask);

    serviceData.dimmerReady      = bitmaskArray[0];
    serviceData.dimmingAllowed   = bitmaskArray[1];
    serviceData.hasError         = bitmaskArray[2];
    serviceData.switchLocked     = bitmaskArray[3];
    serviceData.timeIsSet        = bitmaskArray[4];
    serviceData.switchCraftEnabled = bitmaskArray[5];
    serviceData.tapToToggleEnabled  = bitmaskArray[6];
    serviceData.behaviourOverridden = bitmaskArray[7];

    serviceData.uniqueIdentifier   = serviceData.partialTimestamp;

    if (serviceData.timeIsSet) {
      serviceData.timestamp = reconstructTimestamp(new Date().valueOf() * 0.001, serviceData.partialTimestamp);
    }
    else {
      serviceData.timestamp = serviceData.partialTimestamp; // this is now a counter
    }
  }
}


