import { PromiseCallback } from "../types/declarations";
export declare const emailChecker: (email: any) => boolean;
export declare const characterChecker: (value: any) => boolean;
export declare const numberChecker: (value: any) => boolean;
export declare const Util: {
    boundToUnity: (value: any) => number;
    bound0_100: (value: any) => number;
    getBitMaskUInt8: (value: any) => any[];
    getBitMaskUInt32: (value: any) => any[];
    UInt32FromBitmask: (bitMask: any) => number;
    getUUID: () => string;
    getToken: () => string;
    mixin: (base: any, section: any) => void;
    versions: {
        isHigher: (version: any, compareWithVersion: any) => boolean;
        canIUse: (myVersion: any, minimumRequiredVersion: any) => boolean;
        isHigherOrEqual: (version: any, compareWithVersion: any) => boolean;
        isLower: (version: any, compareWithVersion: any) => boolean;
    };
    deepExtend: (a: any, b: any, protoExtend?: boolean, allowDeletion?: boolean) => any;
    promiseBatchPerformer: (arr: any[], method: PromiseCallback) => Promise<{}>;
    _promiseBatchPerformer: (arr: any[], index: number, method: PromiseCallback) => Promise<{}>;
};
