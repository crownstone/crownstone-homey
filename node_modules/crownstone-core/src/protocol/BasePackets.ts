import {ControlType} from "./CrownstoneTypes";
import {GetPesistenceMode, SetPesistenceMode} from "../declarations/enums";

const SUPPORTED_PROTOCOL_VERSION = 5

export class BasePacket {
  type = 0;
  length = 0;
  payloadBuffer : any = null;

  constructor(packetType : number) {
    this.type = packetType
  }

  loadKey(keyString) {
    if (keyString.length === 16) {
      this.payloadBuffer = Buffer.from(keyString, 'ascii')
    }
    else {
      this.payloadBuffer = Buffer.from(keyString, 'hex')
    }

    return this._process()
  }

  loadString(string) {
    this.payloadBuffer = Buffer.from(string, 'ascii');
    return this._process()
  }

  loadInt8(int8) {
    this.payloadBuffer = Buffer.alloc(1);
    this.payloadBuffer.writeInt8(int8);
    return this._process()
  }

  loadUInt8(uint8) {
    this.payloadBuffer = Buffer.alloc(1);
    this.payloadBuffer.writeUInt8(uint8);
    return this._process()
  }

  loadUInt16(uint16) {
    this.payloadBuffer = Buffer.alloc(2);
    this.payloadBuffer.writeUInt16LE(uint16);
    return this._process()
  }

  loadUInt32(uint32) {
    this.payloadBuffer = Buffer.alloc(4);
    this.payloadBuffer.writeUInt32LE(uint32);
    return this._process()
  }

  loadByteArray(byteArray) {
    this.payloadBuffer = Buffer.from(byteArray);
    return this._process()
  }

  loadBuffer(buffer) {
    this.payloadBuffer = buffer;
    return this._process()
  }

  _process() {
    this.length = this.payloadBuffer.length;
    return this;
  }

  getPacket() : Buffer {
    let packetLength = 5;
    let buffer = Buffer.alloc(packetLength);

    buffer.writeUInt8(SUPPORTED_PROTOCOL_VERSION, 0)
    buffer.writeUInt16LE(this.type, 1);
    buffer.writeUInt16LE(this.length, 3); // length

    if (this.length > 0 && this.payloadBuffer) {
      buffer = Buffer.concat([buffer, this.payloadBuffer])
    }

    return buffer;
  }
}


export class ControlPacket extends BasePacket {}



export class FactoryResetPacket extends ControlPacket {
  constructor() {
    super(ControlType.FACTORY_RESET);
    this.loadUInt32(0xdeadbeef);
  }
}


export class ControlStateGetPacket extends BasePacket {
  stateType: number;
  id : number = 0;
  persistenceMode : number = GetPesistenceMode.CURRENT;

  constructor(stateType, id, persistenceMode) {
    super(ControlType.GET_STATE);

    this.stateType = stateType;
    this.id = id;
    this.persistenceMode = persistenceMode;
  }

  getPacket() : Buffer {
    let packetLength = 5;
    let buffer = Buffer.alloc(packetLength);

    buffer.writeUInt8(SUPPORTED_PROTOCOL_VERSION, 0)
    buffer.writeUInt16LE(this.type, 1); // the type here is the getState command type.
    buffer.writeUInt16LE(this.length + 6, 3); // length + 2 for the ID size, +2 for the persistence, + 2 for the state type

    // create a buffer for the id value.
    let stateTypeBuffer = Buffer.alloc(2);
    stateTypeBuffer.writeUInt16LE(this.stateType,0);

    // create a buffer for the id value.
    let idBuffer = Buffer.alloc(2);
    idBuffer.writeUInt16LE(this.id,0);

    let persistenceBuffer = Buffer.alloc(2);
    persistenceBuffer.writeUInt8(this.persistenceMode,0);
    persistenceBuffer.writeUInt8(0,1);

    buffer = Buffer.concat([buffer, stateTypeBuffer, idBuffer, persistenceBuffer]);

    return buffer;
  }
}



export class ControlStateSetPacket extends BasePacket {
  stateType: number;
  id : number = 0;
  persistenceMode : number = SetPesistenceMode.STORED;

  constructor(stateType, id, persistenceMode) {
    super(ControlType.SET_STATE);

    this.stateType = stateType;
    this.id = id;
    this.persistenceMode = persistenceMode;
  }

  getPacket() : Buffer {
    let packetLength = 5;
    let buffer = Buffer.alloc(packetLength);

    buffer.writeUInt8(SUPPORTED_PROTOCOL_VERSION, 0)
    buffer.writeUInt16LE(this.type, 1);
    buffer.writeUInt16LE(this.length + 6, 3); // length + 2 for the ID size, +2 for the persistence. +2 for the state type

    // create a buffer for the id value.
    let stateTypeBuffer = Buffer.alloc(2);
    stateTypeBuffer.writeUInt16LE(this.stateType,0);

    // create a buffer for the id value.
    let idBuffer = Buffer.alloc(2);
    idBuffer.writeUInt16LE(this.id,0);

    let persistenceBuffer = Buffer.alloc(2);
    persistenceBuffer.writeUInt8(this.persistenceMode,0);
    persistenceBuffer.writeUInt8(0,1);

    buffer = Buffer.concat([buffer, idBuffer, persistenceBuffer, this.payloadBuffer]);

    return buffer;
  }
}

