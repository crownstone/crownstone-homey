"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("./logging/Log");
const Util_1 = require("./Util");
class EventBusClass {
    constructor() {
        this._topics = {};
        this._topicIds = {};
    }
    on(topic, callback) {
        if (!(topic)) {
            Log_1.LOGe.log('Attempting to subscribe to undefined topic:', topic);
            return;
        }
        if (!(callback)) {
            Log_1.LOGe.log('Attempting to subscribe without callback to topic:', topic);
            return;
        }
        if (this._topics[topic] === undefined)
            this._topics[topic] = [];
        // generate unique id
        let id = Util_1.Util.getUUID();
        Log_1.LOGv.event('Something is subscribing to ', topic, 'got ID:', id);
        this._topics[topic].push({ id, callback });
        this._topicIds[id] = true;
        // return unsubscribe function.
        return () => {
            if (this._topics[topic] !== undefined) {
                // find id and delete
                for (let i = 0; i < this._topics[topic].length; i++) {
                    if (this._topics[topic][i].id === id) {
                        this._topics[topic].splice(i, 1);
                        break;
                    }
                }
                // clear the ID
                this._topicIds[id] = undefined;
                delete this._topicIds[id];
                if (this._topics[topic].length === 0) {
                    delete this._topics[topic];
                }
                Log_1.LOGv.event('Something with ID ', id, ' unsubscribed from ', topic);
            }
        };
    }
    emit(topic, data) {
        if (this._topics[topic] !== undefined) {
            Log_1.LOGi.event(topic, data);
            // Firing these elements can lead to a removal of a point in this._topics.
            // To ensure we do not cause a shift by deletion (thus skipping a callback) we first put them in a separate Array
            let fireElements = [];
            this._topics[topic].forEach((element) => {
                fireElements.push(element);
            });
            fireElements.forEach((element) => {
                // this check makes sure that if a callback has been deleted, we do not fire it.
                if (this._topicIds[element.id] === true) {
                    element.callback(data);
                }
            });
        }
    }
    clearAllEvents() {
        Log_1.LOG.event("Clearing all event listeners.");
        this._topics = {};
        this._topicIds = {};
    }
}
exports.EventBusClass = EventBusClass;
exports.eventBus = new EventBusClass();
//# sourceMappingURL=EventBus.js.map