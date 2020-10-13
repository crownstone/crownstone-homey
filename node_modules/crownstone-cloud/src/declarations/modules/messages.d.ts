interface messages_cloudModule {
    createMessage: (data: any) => Promise<any>;
    receivedMessage: (cloudMessageId: string) => Promise<any>;
    readMessage: (cloudMessageId: string) => Promise<any>;
    getMessage: (cloudMessageId: string) => Promise<any>;
    getNewMessagesInSphere: () => Promise<any>;
    getAllMessagesInSphere: () => Promise<any>;
    getNewMessagesInLocation: (cloudLocationId: string) => Promise<any>;
    getActiveMessages: () => Promise<any>;
    addRecipient: (recipientId: string) => Promise<any>;
    deleteMessage: (cloudMessageId: string) => Promise<any>;
    deleteAllMessages: () => Promise<any>;
}
