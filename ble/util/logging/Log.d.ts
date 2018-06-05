export declare class Logger {
    level: number;
    levelPrefix: string;
    constructor(level: any);
    log(...any: any[]): void;
    ble(...any: any[]): void;
    usb(...any: any[]): void;
    event(...any: any[]): void;
    cloud(...any: any[]): void;
    system(...any: any[]): void;
    error(...any: any[]): void;
    warn(...any: any[]): void;
    info(...any: any[]): void;
    debug(...any: any[]): void;
    verbose(...any: any[]): void;
    _getPrefix(level: any): "v" | "d" | "i" | "w" | "e";
    _log(type: any, configCheckField: any, allArguments: any): void;
    _logType(type: any, configCheckField: any, forcedLevel: any, allArguments: any): void;
}
export declare const LOGv: Logger;
export declare const LOGd: Logger;
export declare const LOGi: Logger;
export declare const LOG: Logger;
export declare const LOGw: Logger;
export declare const LOGe: Logger;
