interface listeners_webhookModule {
    isListenerActive: (token) => Promise<boolean>;
    deleteListenersByToken: (token) => Promise<Count>;
    deleteListener: (listenerId) => Promise<Count>;
    createListener: (listenerData: any) => any;
    getListeners: () => any;
}

interface Count {
    count: number
}