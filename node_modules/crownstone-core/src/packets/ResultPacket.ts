/**
 * Wrapper for all relevant data of the object
 *
 */
import {DataStepper} from "../util/DataStepper";
import {ControlTypeInv, ResultValueInv} from "../protocol/CrownstoneTypes";

export class ResultPacket {
  commandType;
  type;
  opCode;
  protocol;
  resultCode;
  size : number;
  payload : Buffer;

  valid = false;

  constructor(data : Buffer) {
    this.load(data);
  }

  load(data : Buffer) {
    let minSize = 7;

    if (data.length >= minSize) {
      this.valid = true;

      let stepper = new DataStepper(data);

      this.protocol = stepper.getUInt8();
      this.commandType = stepper.getUInt16();
      this.resultCode  = stepper.getUInt16();

      if (ControlTypeInv[this.commandType] === undefined || ResultValueInv[this.resultCode] === undefined) {
        this.valid = false;
        return;
      }

      this.size = stepper.getUInt16();

      let totalSize = minSize + this.size;

      if (data.length >= totalSize) {
        this.payload = stepper.getBuffer(this.size);
      }
      else {
        this.valid = false
      }
    }
    else {
      this.valid = false
    }
  }
}


