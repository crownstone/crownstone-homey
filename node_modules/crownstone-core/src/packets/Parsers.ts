import {ServiceData} from "./ServiceData";
import {parseOpCode3_type0} from "./AdvertisementTypes/OpCode3/opCode3_type0";
import {parseOpCode3_type1} from "./AdvertisementTypes/OpCode3/opCode3_type1";
import {parseOpCode3_type2} from "./AdvertisementTypes/OpCode3/opCode3_type2";
import {parseOpCode3_type3} from "./AdvertisementTypes/OpCode3/opCode3_type3";
import {parseOpCode4_type0} from "./AdvertisementTypes/OpCode4/opCode4_type0";
import {parseOpCode7_type4} from "./AdvertisementTypes/OpCode7/opCode7_type4";



export function parseOpCode3( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 16) { return; }

  serviceData.dataType = data.readUInt8(0);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode3_type0(serviceData, data);
      break;
    case 1:
      parseOpCode3_type1(serviceData, data);
      break;
    case 2:
      parseOpCode3_type2(serviceData, data);
      break;
    case 3:
      parseOpCode3_type3(serviceData, data);
      break;
    default:
      parseOpCode3_type0(serviceData, data)
  }
}


export function parseOpCode4( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 16) { return; }

  serviceData.setupMode = true;

  serviceData.dataType = data.readUInt8(0);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode4_type0(serviceData, data);
      break;
    default:
      parseOpCode4_type0(serviceData, data)

  }
}


export function parseOpCode5( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 16) { return; }

  serviceData.dataType = data.readUInt8(0);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode3_type0(serviceData, data);
      break;
    case 1:
      parseOpCode3_type1(serviceData, data);
      break;
    case 2:
      parseOpCode3_type2(serviceData, data);
      break;
    case 3:
      parseOpCode3_type3(serviceData, data);
      break;
    case 4:
      parseOpCode7_type4(serviceData, data);
      break;
    default:
      parseOpCode3_type0(serviceData, data)
  }
}


export function parseOpCode6( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 16) { return; }

  serviceData.dataType = data.readUInt8(0);
  serviceData.setupMode = true;

  switch(serviceData.dataType) {
    case 0:
      parseOpCode4_type0(serviceData, data);
      break;
    default:
      parseOpCode4_type0(serviceData, data)

  }
}