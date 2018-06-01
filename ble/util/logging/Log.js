"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../../Config");
const LogLevels_1 = require("./LogLevels");
class Logger {
    constructor(level) {
        this.level = level;
        this.levelPrefix = this._getPrefix(level);
    }
    log(...any) {
        this._log('Info -----', Config_1.LogConfig.log, arguments);
    }
    ble(...any) {
        this._log('BLE ------', Config_1.LogConfig.ble, arguments);
    }
    usb(...any) {
        this._log('USB ------', Config_1.LogConfig.usb, arguments);
    }
    event(...any) {
        this._log('Event ----', Config_1.LogConfig.events, arguments);
    }
    cloud(...any) {
        this._log('Cloud ----', Config_1.LogConfig.cloud, arguments);
    }
    system(...any) {
        this._log('System ---', Config_1.LogConfig.system, arguments);
    }
    error(...any) {
        this._logType('ERROR ----', Config_1.LogConfig.log, LogLevels_1.LOG_LEVEL.error, arguments);
    }
    warn(...any) {
        this._logType('WARNING --', Config_1.LogConfig.log, LogLevels_1.LOG_LEVEL.warning, arguments);
    }
    info(...any) {
        this._logType('Info -----', Config_1.LogConfig.log, LogLevels_1.LOG_LEVEL.info, arguments);
    }
    debug(...any) {
        this._logType('Debug ----', Config_1.LogConfig.log, LogLevels_1.LOG_LEVEL.debug, arguments);
    }
    verbose(...any) {
        this._logType('Verbose --', Config_1.LogConfig.log, LogLevels_1.LOG_LEVEL.debug, arguments);
    }
    _getPrefix(level) {
        switch (level) {
            case LogLevels_1.LOG_LEVEL.verbose:
                return 'v';
            case LogLevels_1.LOG_LEVEL.debug:
                return 'd';
            case LogLevels_1.LOG_LEVEL.info:
                return 'i';
            case LogLevels_1.LOG_LEVEL.warning:
                return 'w';
            case LogLevels_1.LOG_LEVEL.error:
                return 'e';
            default:
                return 'v';
        }
    }
    _log(type, configCheckField, allArguments) {
        if (configCheckField <= this.level) {
            let args = ['LOG' + this.levelPrefix + ' ' + type + ' :'];
            for (let i = 0; i < allArguments.length; i++) {
                let arg = allArguments[i];
                args.push(arg);
            }
            console.log.apply(this, args);
        }
    }
    _logType(type, configCheckField, forcedLevel, allArguments) {
        if (configCheckField <= forcedLevel) {
            let args = ['LOG' + this._getPrefix(forcedLevel) + ' ' + type + ' :'];
            for (let i = 0; i < allArguments.length; i++) {
                let arg = allArguments[i];
                args.push(arg);
            }
            console.log.apply(this, args);
        }
    }
}
exports.Logger = Logger;
exports.LOGv = new Logger(LogLevels_1.LOG_LEVEL.verbose);
exports.LOGd = new Logger(LogLevels_1.LOG_LEVEL.debug);
exports.LOGi = new Logger(LogLevels_1.LOG_LEVEL.info);
exports.LOG = new Logger(LogLevels_1.LOG_LEVEL.info);
exports.LOGw = new Logger(LogLevels_1.LOG_LEVEL.warning);
exports.LOGe = new Logger(LogLevels_1.LOG_LEVEL.error);
//# sourceMappingURL=Log.js.map