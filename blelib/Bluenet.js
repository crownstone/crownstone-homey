Object.defineProperty(exports, "__esModule", { value: true });
const BleHandler = require("./BleHandler");
const ControlHandler_1 = require("./ble/modules/ControlHandler");
class Bluenet {
    constructor() {
        this.bleHandler = new BleHandler.BleHandler();
        this.control = new ControlHandler_1.ControlHandler(this.bleHandler);
    }
    connect(connectData) {
        return this.bleHandler.connect(connectData)
            .then(() => {
                this.log("Getting Session nonce...");
                return this.control.getAndSetSessionNonce();
            })
            .then(() => {
                this.log("Session nonce obtained");
            });
    }

    disconnect() {
        return this.bleHandler.disconnect();
    }
}
exports.default = Bluenet;
