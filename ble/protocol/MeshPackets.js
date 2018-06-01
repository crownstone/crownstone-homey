class StoneKeepAlivePacket {
    /**
     crownstoneId: byte
     action:  boolean
     state:  number [0..1]
     */
    constructor(crownstoneId, action, state) {
        this.crownstoneId = 0;
        this.actionAndState = 0;
        let switchState = Math.min(1, Math.max(0, state)) * 100;
        if (!action) {
            switchState = 255;
        }
        this.crownstoneId = crownstoneId;
        this.actionAndState = switchState;
    }
    getPacket() {
        let packet = Buffer.alloc(2);
        packet.writeUInt8(this.crownstoneId, 0);
        packet.writeUInt8(this.actionAndState, 1);
        return packet;
    }
}
class MeshKeepAlivePacket {
    constructor() {
        this.type = 0;
        this.timeout = 0;
        this.reserved = [];
        this.packets = [];
    }
    contructor(packetType, timeout, packets) {
        this.type = packetType.value;
        this.timeout = timeout;
        this.packets = packets;
        this.reserved = [0, 0];
    }
    getPacket() {
        let packet = Buffer.alloc(4);
        packet.writeUInt8(this.type, 0);
        packet.writeUInt16BE(this.timeout, 1);
        packet.writeUInt8(this.packets.length, 3);
        for (let i = 0; i < this.packets.length; i++) {
            packet = Buffer.concat([packet, this.packets[i].getPacket()]);
        }
        return packet;
    }
}
class MeshCommandPacket {
    constructor() {
        this.type = 0;
        this.bitmask = 0;
        this.crownstoneIds = [];
    }
    contructor(packetType, crownstoneIds, payload) {
        this.type = packetType;
        this.crownstoneIds = crownstoneIds;
        this.payload = payload;
    }
    getPacket() {
        let idBuffer = Buffer.alloc(this.crownstoneIds.length);
        for (let i = 0; i < this.crownstoneIds.length; i++) {
            idBuffer.writeUInt8(this.crownstoneIds[i], i);
        }
        let packet = Buffer.alloc(4);
        packet.writeUInt8(this.type, 0);
        packet.writeUInt8(this.bitmask, 1);
        packet.writeUInt8(this.crownstoneIds.length, 2);
        packet = Buffer.concat([packet, idBuffer, this.payload]);
        return packet;
    }
}
class StoneMultiSwitchPacket {
    constructor() {
        this.timeout = 0;
        this.crownstoneId = 0;
        this.state = 0;
        this.intent = 0;
    }
    /**
     * crownstoneId:
     * state:  number [0..1]
     * timeout:
     * intent: intentType
     **/
    contructor(crownstoneId, state, timeout, intent) {
        this.crownstoneId = crownstoneId;
        this.state = Math.min(1, Math.max(0, state)) * 100; // map to [0 .. 100]
        this.timeout = timeout;
        this.intent = intent;
    }
    getPacket() {
        let packet = Buffer.alloc(5);
        packet.writeUInt8(this.crownstoneId, 0);
        packet.writeUInt8(this.state, 1);
        packet.writeUInt16BE(this.timeout, 2);
        packet.writeUInt8(this.intent, 4);
        return packet;
    }
}
class MeshMultiSwitchPacket {
    constructor() {
        this.type = 0;
        this.packets = [];
    }
    contructor(packetType, packets) {
        this.type = packetType;
        this.packets = packets;
    }
    getPacket() {
        let packet = Buffer.alloc(2);
        packet.writeUInt8(this.type, 0);
        packet.writeUInt8(this.packets.length, 1);
        for (let i = 0; i < this.packets.length; i++) {
            packet = Buffer.concat([packet, this.packets[i].getPacket()]);
        }
        return packet;
    }
}
//# sourceMappingURL=MeshPackets.js.map