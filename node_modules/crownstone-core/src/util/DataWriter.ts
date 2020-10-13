import {CrownstoneError} from "../protocol/CrownstoneError";
import {CrownstoneErrorType} from "../declarations/enums";


export class DataWriter {

  buffer : Buffer;
  position = 0;
  totalSize = 0;

  constructor(totalSize) {
    this.totalSize = totalSize;
    this.buffer = Buffer.alloc(totalSize);
  }

  getBuffer() : Buffer {
    return this.buffer;
  }

  putBuffer(buffer: Buffer) {
    this.position  += buffer.length;
    this.totalSize += buffer.length;
    this.buffer = Buffer.concat([this.buffer, buffer]);
  }

  putUInt32(data: number) {
    this._place(data, 4, "writeUInt32LE")
  }

  putUInt24(data: number) {
    let tempBuffer = Buffer.alloc(4);
    tempBuffer.writeUInt32LE(data, 0);
    this._place(tempBuffer[0], 1, "writeUInt8")
    this._place(tempBuffer[1], 1, "writeUInt8")
    this._place(tempBuffer[2], 1, "writeUInt8")
  }

  putUInt16(data: number) {
    this._place(data, 2, "writeUInt16LE");
  }

  putUInt8(data : number) {
    this._place(data, 1, "writeUInt8");
  }

  _place(data, count, method : "writeUInt16LE" | "writeUInt8" | "writeUInt32LE") {
    if (this.totalSize - (this.position+count) >= 0) {
      this.buffer[method](data, this.position);
      this.position += count;
    }
    else {
      throw new CrownstoneError(CrownstoneErrorType.BUFFER_TOO_SHORT_FOR_DATA, "You tried to push more data into the buffer than you have allocated space for.")
    }
  }

}