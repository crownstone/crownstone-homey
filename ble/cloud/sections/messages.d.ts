export declare const messages: {
    createMessage: (data: any, background: any) => any;
    receivedMessage: (cloudMessageId: any, background: any) => any;
    readMessage: (cloudMessageId: any, background: any) => any;
    getMessage: (cloudMessageId: any, background?: boolean) => any;
    getNewMessagesInSphere: (background?: boolean) => any;
    getAllMessagesInSphere: (background?: boolean) => any;
    getNewMessagesInLocation: (cloudLocationId: any, background?: boolean) => any;
    getActiveMessages: (background?: boolean) => any;
    addRecipient: (recipientId: any, background?: boolean) => any;
    deleteMessage: (cloudMessageId: any, background?: boolean) => any;
    deleteAllMessages: (background?: boolean) => any;
};
