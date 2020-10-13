import {Logger} from "../Logger";
const LOG = Logger(__filename);

export class NotificationMerger {
  data;
  callback;
  lastPacketIndex;

  constructor(callback) {
    this.data = Buffer.alloc(0);
    this.callback = callback;
    this.lastPacketIndex = 0xFF;
  }


  /**
   * Incoming data has an index byte on the first byte
   * @param incomingData
   */
  merge(incomingData: Buffer) {
    if (incomingData.length > 0) {
      let counter = incomingData.readUInt8(0);

      if (counter === 0xFF) {
        this.data = Buffer.concat([this.data,incomingData.slice(1)]);
        this.callback(this.data);
        this.data = Buffer.alloc(0);
      }
      else {
        if (counter == 0 && this.lastPacketIndex == 0xFF || (counter > 0 && (counter - 1) == this.lastPacketIndex)) {
          this.data = Buffer.concat([this.data,incomingData.slice(1)]);
        }
        else {
          LOG.warn("missed packet, invalid payload")
        }
      }
      this.lastPacketIndex = counter;
    }
  }

}
