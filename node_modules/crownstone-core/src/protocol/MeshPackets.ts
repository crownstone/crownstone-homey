export class StoneMultiSwitchPacket {
  crownstoneId = 0;
  state = 0;

  /**
   * crownstoneId:
   * state:  number [0..255]
   **/
  constructor(crownstoneId : number, state : number) {
    this.crownstoneId = crownstoneId;
    if (state <= 1) {
      this.state = Math.min(1, Math.max(0, state)) * 100; // map to [0 .. 100]
    }
    else {
      this.state = state;
    }
  }

  getPacket() {
    let packet = Buffer.alloc(2);
    packet.writeUInt8(this.crownstoneId,0);
    packet.writeUInt8(this.state,1);

    return packet
  }
}


export class MeshMultiSwitchPacket {
  packets = [];

  constructor(packets : StoneMultiSwitchPacket[]) {
    this.packets = packets;
  }

  getPacket() {
    let packet = Buffer.alloc(1);
    packet.writeUInt8(this.packets.length,0);

    for (let i = 0; i < this.packets.length; i++) {
      packet = Buffer.concat([packet, this.packets[i].getPacket()]);
    }

    return packet;
  }
}