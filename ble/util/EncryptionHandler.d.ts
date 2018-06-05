/// <reference types="node" />
import { BluenetSettings } from "../BluenetSettings";
export declare class EncryptionHandler {
    static decryptSessionNonce(rawNonce: Buffer, key: Buffer): Buffer;
    static encrypt(data: Buffer, settings: BluenetSettings): Buffer;
    static decrypt(data: Buffer, settings: BluenetSettings): Buffer;
    static _decrypt(data: Buffer, sessionData: SessionData, settings: BluenetSettings): Buffer;
    static _verifyDecryption(decrypted: Buffer, sessionData: SessionData): Buffer;
    static decryptAdvertisement(data: any, key: any): Buffer;
    static generateIV(packetNonce: Buffer, sessionData: Buffer): Buffer;
    static _getKey(userLevel: any, settings: BluenetSettings): Buffer;
    static fillWithRandomNumbers(buff: any): void;
}
export declare class SessionData {
    sessionNonce: any;
    validationKey: any;
    constructor(sessionData: any);
}
export declare class EncryptedPackage {
    nonce: Buffer;
    userLevel: number;
    payload: Buffer;
    constructor(data: Buffer);
    getPayload(): Buffer;
}
