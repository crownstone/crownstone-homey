import {ControlType} from './CrownstoneTypes';
import {ControlPacket, FactoryResetPacket} from "./BasePackets";
import {Util} from "../util/Util";
import {DataWriter} from "../util/DataWriter";

export class ControlPacketsGenerator {

  static getFactoryResetPacket() {
    let buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(0xdeadbeef,0);
    return buffer
  }

  static getCommandFactoryResetPacket() {
    return new FactoryResetPacket().getPacket()
  }

  static getSwitchStatePacket(switchState: number) {
    let convertedSwitchState = Util.bound0_100(switchState);
    return new ControlPacket(ControlType.SWITCH).loadUInt8(convertedSwitchState).getPacket()
  }

  static getResetPacket() {
    return new ControlPacket(ControlType.RESET).getPacket()
  }

  static getPutInDFUPacket() {
    return new ControlPacket(ControlType.GOTO_DFU).getPacket()
  }

  static getDisconnectPacket() {
    return new ControlPacket(ControlType.DISCONNECT).getPacket()
  }

  /**
   * @param state : 0 or 1
   * @returns {Buffer}
   */
  static getRelaySwitchPacket(state) {
    return new ControlPacket(ControlType.RELAY).loadUInt8(state).getPacket()
  }

  /**
   * @param switchState   [0 .. 1]
   * @returns {Buffer}
   */
  static getPwmSwitchPacket(switchState) {
    let convertedSwitchState = Util.bound0_100(switchState);

    return new ControlPacket(ControlType.PWM).loadUInt8(convertedSwitchState).getPacket()
  }


  static getResetErrorPacket(errorMask) {
    return new ControlPacket(ControlType.RESET_ERRORS).loadUInt32(errorMask).getPacket()
  }

  /**
   * This is a LOCAL timestamp since epoch in seconds

   so if you live in GMT + 1 add 3600 to the timestamp

   * @param time
   * @returns {Buffer}
   */
  static getSetTimePacket(time) {
    return new ControlPacket(ControlType.SET_TIME).loadUInt32(time).getPacket()
  }

  static getAllowDimmingPacket(allow) {
    let allowByte = 0;
    if (allow) {
      allowByte = 1
    }

    return new ControlPacket(ControlType.ALLOW_DIMMING).loadUInt8(allowByte).getPacket()
  }

  static getLockSwitchPacket(lock) {
    let lockByte = 0;
    if (lock) {
      lockByte = 1
    }
    return new ControlPacket(ControlType.LOCK_SWITCH).loadUInt8(lockByte).getPacket()
  }

  static getRegisterTrackedDevicesPacket(
    trackingNumber:number,
    locationUID:number,
    profileId:number,
    rssiOffset:number,
    ignoreForPresence:boolean,
    tapToToggleEnabled:boolean,
    deviceToken:number,
    ttlMinutes:number
  ) {
    let data = new DataWriter(11);
    data.putUInt16(trackingNumber);
    data.putUInt8(locationUID);
    data.putUInt8(profileId);
    data.putUInt8(rssiOffset);

    let flags = 0;
    if (ignoreForPresence)  { flags += 1 << 1; }
    if (tapToToggleEnabled) { flags += 1 << 2; }

    data.putUInt8(flags)
    data.putUInt24(deviceToken);
    data.putUInt16(ttlMinutes);

    return new ControlPacket(ControlType.REGISTER_TRACKED_DEVICE).loadBuffer(data.getBuffer()).getPacket()
  }

  static getUartMessagePacket(message: string) : Buffer {
    return new ControlPacket(ControlType.UART_MESSAGE).loadString(message).getPacket()
  }


  static getSetupPacket(type, crownstoneId, adminKey : Buffer, memberKey : Buffer, guestKey : Buffer, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor) {
    let prefix = Buffer.alloc(2);
    prefix.writeUInt8(type,         0);
    prefix.writeUInt8(crownstoneId, 1);


    let meshBuffer = Buffer.alloc(4);
    meshBuffer.writeUInt32LE(meshAccessAddress,0);

    let processedUUID = ibeaconUUID.replace(/:/g,"").replace(/-/g,"");
    let uuidBuffer = Buffer.from(Buffer.from(processedUUID, 'hex').reverse());
    let ibeaconBuffer = Buffer.alloc(4);
    ibeaconBuffer.writeUInt16LE(ibeaconMajor, 0);
    ibeaconBuffer.writeUInt16LE(ibeaconMinor, 2);

    let data = Buffer.concat([prefix, adminKey, memberKey, guestKey, meshBuffer, uuidBuffer, ibeaconBuffer]);

    return new ControlPacket(ControlType.SETUP).loadByteArray(data).getPacket()
  }

  static getSetupPacketV2(
    sphereUid,
    crownstoneId,
    adminKey : Buffer,
    memberKey : Buffer,
    basicKey : Buffer,
    serviceDataKey : Buffer,
    localizationKey : Buffer,
    meshNetworkKey : Buffer,
    meshAppKey : Buffer,
    meshDeviceKey : Buffer,
    ibeaconUUID,
    ibeaconMajor,
    ibeaconMinor
  ) {
    let prefix = Buffer.alloc(2);
    prefix.writeUInt8(crownstoneId, 0);
    prefix.writeUInt8(sphereUid,    1);

    let processedUUID = ibeaconUUID.replace(/:/g,"").replace(/-/g,"");
    let uuidBuffer = Buffer.from(Buffer.from(processedUUID, 'hex').reverse());
    let ibeaconBuffer = Buffer.alloc(4);
    ibeaconBuffer.writeUInt16LE(ibeaconMajor, 0);
    ibeaconBuffer.writeUInt16LE(ibeaconMinor, 2);

    let data = Buffer.concat([prefix, adminKey, memberKey, basicKey, serviceDataKey, localizationKey, meshDeviceKey, meshAppKey, meshNetworkKey, uuidBuffer, ibeaconBuffer]);

    return new ControlPacket(ControlType.SETUP).loadByteArray(data).getPacket()
  }
}
