"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("./logging/Log");
class NotificationMerger {
    constructor(callback) {
        this.data = Buffer.alloc(0);
        this.callback = callback;
        this.lastPacketIndex = 0xFF;
    }
    /**
     * Incoming data has an index byte on the first byte
     * @param incomingData
     */
    merge(incomingData) {
        if (incomingData.length > 0) {
            let counter = incomingData.readUInt8(0);
            if (counter === 0xFF) {
                this.data = Buffer.concat([this.data, incomingData.slice(1)]);
                this.callback(this.data);
                this.data = Buffer.alloc(0);
            }
            else {
                if (counter == 0 && this.lastPacketIndex == 0xFF || (counter > 0 && (counter - 1) == this.lastPacketIndex)) {
                    this.data = Buffer.concat([this.data, incomingData.slice(1)]);
                }
                else {
                    Log_1.LOG.warn("----- BLUENET NotificationMerger: missed packet, invalid payload");
                }
            }
            this.lastPacketIndex = counter;
        }
    }
}
exports.NotificationMerger = NotificationMerger;
//# sourceMappingURL=NotificationMerger.js.map