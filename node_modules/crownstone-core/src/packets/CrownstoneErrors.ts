import { Util } from "../util/Util";

/**
 * Wrapper for all relevant data of the object
 *
 4 | Dimmer on failure  | If this is 1, the dimmer is broken, in an always (partial) on  state.
 5 | Dimmer off failure | If this is 1, the dimmer is broken, in an always (partial) off state.
 */


export class CrownstoneErrors {
  overCurrent        = false;
  overCurrentDimmer  = false;
  temperatureChip    = false;
  temperatureDimmer  = false;
  dimmerOnFailure    = false;
  dimmerOffFailure   = false;

  bitMask = 0;

  constructor(bitMask) {
    this.bitMask = bitMask;

    let bitArray = Util.getBitMaskUInt32(bitMask);

    this.overCurrent       = bitArray[31-0];
    this.overCurrentDimmer = bitArray[31-1];
    this.temperatureChip   = bitArray[31-2];
    this.temperatureDimmer = bitArray[31-3];
    this.dimmerOnFailure   = bitArray[31-4];
    this.dimmerOffFailure  = bitArray[31-5]
  }

  loadJSON(dictionary) {
    this.overCurrent       = dictionary["overCurrent"]       === undefined ? dictionary["overCurrent"]       :  false;
    this.overCurrentDimmer = dictionary["overCurrentDimmer"] === undefined ? dictionary["overCurrentDimmer"] :  false;
    this.temperatureChip   = dictionary["temperatureChip"]   === undefined ? dictionary["temperatureChip"]   :  false;
    this.temperatureDimmer = dictionary["temperatureDimmer"] === undefined ? dictionary["temperatureDimmer"] :  false;
    this.dimmerOnFailure   = dictionary["dimmerOnFailure"]   === undefined ? dictionary["dimmerOnFailure"]   :  false;
    this.dimmerOffFailure  = dictionary["dimmerOffFailure"]  === undefined ? dictionary["dimmerOffFailure"]  :  false;

    let bitArray = Array(32).fill(false);
    bitArray[31-0] = this.overCurrent;
    bitArray[31-1] = this.overCurrentDimmer;
    bitArray[31-2] = this.temperatureChip;
    bitArray[31-3] = this.temperatureDimmer;
    bitArray[31-4] = this.dimmerOnFailure;
    bitArray[31-5] = this.dimmerOffFailure;

    this.bitMask = Util.UInt32FromBitmask(bitArray)
  }

  getResetMask() {
    return this.bitMask
  }

  hasErrors() {
    return this.bitMask == 0
  }

  getJSON()  {
    let obj  = {
      overCurrent       : this.overCurrent,
      overCurrentDimmer : this.overCurrentDimmer,
      temperatureChip   : this.temperatureChip,
      temperatureDimmer : this.temperatureDimmer,
      dimmerOnFailure   : this.dimmerOnFailure,
      dimmerOffFailure  : this.dimmerOffFailure,
      bitMask           : this.bitMask,
    };

    return obj
  }
}
