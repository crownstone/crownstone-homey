export declare class EventBusClass {
    _topics: object;
    _topicIds: object;
    constructor();
    on(topic: any, callback: any): () => void;
    emit(topic: any, data?: any): void;
    clearAllEvents(): void;
}
export declare let eventBus: any;
