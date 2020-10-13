import path from "path";
import fs from "fs";
import {validatePath} from "./util";

const winston = require('winston');
require('winston-daily-rotate-file');
const util = require('util');


/** Setting up the formatter**/
function transform(info : any, opts: any) {
  const args = info[Symbol.for('splat')];
  if (args) { info.message = util.format(info.message, ...args); }
  return info;
}
function utilFormatter() { return {transform}; }
// @ts-ignore
let formatter = winston.format.printf(({level, message, label, timestamp}) => `${timestamp} ${label || '-'} ${level}: ${message}`)
let aggregatedFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
  utilFormatter(),     // <-- this is what changed
  formatter,
);
// -----------------------------------

// CUSTOM LEVELS AND COLORS
const levels = {
  none:     0,
  critical: 1,
  error:    2,
  warn:     3,
  notice:   4,
  info:     5,
  debug:    6,
  verbose:  7,
  silly:    8
}
const colors = {
  none:     'gray',
  critical: 'bold black redBG',
  error:    'bold red',
  warn:     'bold yellow',
  notice:   'magenta',
  info:     'green',
  debug:    'cyan',
  verbose:  'gray',
  silly:    'white',
};

// -----------------------------------


// CONFIGURE TRANSPORTS
let fileLogBaseName     = process.env.CS_FILE_LOGGING_BASENAME          || 'crownstone-log';
let FILE_LOG_LEVEL      = process.env.CS_FILE_LOGGING_LEVEL             || 'info';
let CONSOLE_LOG_LEVEL   = process.env.CS_CONSOLE_LOGGING_LEVEL          || 'info';
let fileLoggingSilent   = true;
const SILENT_FLAG_PRESENT = process.argv.indexOf("--silent") >= 0;
if (process.env.CS_ENABLE_FILE_LOGGING === 'true') {
  fileLoggingSilent = false;
}
if (SILENT_FLAG_PRESENT) {
  fileLoggingSilent = true;
}
if (FILE_LOG_LEVEL === 'none') {
  fileLoggingSilent = true;
}





const addFileLoggingToLoggers = function() {
  let loggers = winston.loggers.loggers.keys();
  for (let loggerId of loggers) {
    let logger = winston.loggers.get(loggerId);
    if (!logger) { continue; }
    if (TransportReferences[loggerId].file) {
      logger.remove(TransportReferences[loggerId].file);
    }
    if (SILENT_FLAG_PRESENT === false) {
      logger.add(generateFileLogger(loggerId));
    }
  }
}
const removeFileLoggingFromLoggers = function() {
  let loggers = winston.loggers.loggers.keys();
  for (let loggerId of loggers) {
    let logger = winston.loggers.get(loggerId);
    if (!logger) { continue; }
    if (TransportReferences[loggerId].file) {
      logger.remove(TransportReferences[loggerId].file);
      TransportReferences[loggerId].file = null;
    }
  }
}

// -----------------------------------

let TransportReferences = {};
let FileLoggingEnabled = !fileLoggingSilent;


function _createLogger(projectName) : {logger: any, transports: {console: any, file:any}} {
  if (winston.loggers.has(projectName)) {
    return { logger: winston.loggers.get(projectName), transports: TransportReferences[projectName] };
  }

  let transports = {
    console: new winston.transports.Console({
      level: CONSOLE_LOG_LEVEL,
      format: winston.format.combine(winston.format.colorize(), aggregatedFormat)
    }),
    file: null
  }

  TransportReferences[projectName] = transports;

  let transportsToUse = [transports.console];
  if (FileLoggingEnabled) {
    transports.file = generateFileLogger(projectName);
    transportsToUse.push(transports.file);
  }
  winston.loggers.add(projectName,{
    levels: levels,
    transports: transportsToUse,
  });
  winston.addColors(colors);
  return {logger:winston.loggers.get(projectName), transports: transports};
}


function generateFileLogger(loggerName) {
  let storagePath =  process.env.CS_FILE_LOGGING_DIRNAME || 'logs';
  validatePath(storagePath);
  TransportReferences[loggerName].file = new winston.transports.DailyRotateFile({
    filename: fileLogBaseName+'-%DATE%.log',
    level: FILE_LOG_LEVEL,
    format: aggregatedFormat,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    dirname: storagePath,
    maxSize:  '50m',
    maxFiles: '14d',
    auditFile: path.join(storagePath,'crownstone-log-config.json')
  });
  return TransportReferences[loggerName].file;
}


const none : _logGetter = function(logger, filename) {
  return function() { logger.none(filename, ...arguments)};
}
const critical : _logGetter = function(logger, filename) {
  return function() { logger.critical(filename, ...arguments) };
}
const error : _logGetter = function(logger, filename) {
  return function() { logger.error(filename, ...arguments) };
}
const warn : _logGetter = function(logger, filename) {
  return function() { logger.warn(filename, ...arguments) };
}
const notice : _logGetter = function(logger, filename) {
  return function() { logger.notice(filename, ...arguments) };
}
const info : _logGetter = function(logger, filename) {
  return function() { logger.info(filename, ...arguments) };
}
const debug : _logGetter = function(logger, filename) {
  return function() { logger.debug(filename, ...arguments) };
}
const verbose : _logGetter = function(logger, filename) {
  return function() { logger.verbose(filename, ...arguments) };
}
const silly : _logGetter = function(logger, filename) {
  return function() { logger.silly(filename, ...arguments) };
}

function generateCustomLogger(loggerData: {logger: Logger, transports: {console: any, file:any}}, projectName: string, filename: string) : Logger {
  return {
    _logger:     loggerData.logger,
    transports:  loggerData.transports,
    config: {
      getTransportForLogger: (loggerId) => {
        return TransportReferences[loggerId];
      },
      getLoggerIds: () => {
        return Object.keys(TransportReferences);
      },
      setFileLogging: (state) => {
        if (state) {
          addFileLoggingToLoggers();
        }
        else {
          removeFileLoggingFromLoggers();
        }
      },
      setLevel: (level: TransportLevel) => {
        CONSOLE_LOG_LEVEL = level;
        FILE_LOG_LEVEL = level;
        Object.keys(TransportReferences).forEach((projectName) => {
          TransportReferences[projectName].console.level = level;
          if (TransportReferences[projectName].file) {
            TransportReferences[projectName].file.level = level;
          }
        })
      },
      setConsoleLevel: (level: TransportLevel) => {
        CONSOLE_LOG_LEVEL = level;
        Object.keys(TransportReferences).forEach((projectName) => {
          TransportReferences[projectName].console.level = level;
        })
      },
      setFileLevel: (level: TransportLevel) => {
        FILE_LOG_LEVEL = level;
        Object.keys(TransportReferences).forEach((projectName) => {
          if (TransportReferences[projectName].file) {
            TransportReferences[projectName].file.level = level;
          }
        })
      }
    },

    none:        none(    loggerData.logger,projectName + ":" + filename + " - "),
    critical:    critical(loggerData.logger,projectName + ":" + filename + " - "),
    error:       error(   loggerData.logger,projectName + ":" + filename + " - "),
    warn:        warn(    loggerData.logger,projectName + ":" + filename + " - "),
    notice:      notice(  loggerData.logger,projectName + ":" + filename + " - "),
    info:        info(    loggerData.logger,projectName + ":" + filename + " - "),
    debug:       debug(   loggerData.logger,projectName + ":" + filename + " - "),
    verbose:     verbose( loggerData.logger,projectName + ":" + filename + " - "),
    silly:       silly(   loggerData.logger,projectName + ":" + filename + " - "),
  }
}


export const generateProjectLogger = function(projectName: string) {
  return function getLogger(_filename: string, individialLogger= false) : Logger {
    let filename = path.basename(_filename).replace(path.extname(_filename),'');
    let evaluatedProjectName = projectName;
    if (individialLogger) {
      evaluatedProjectName = projectName + ":" + filename;
    }
    let customLoggerData = _createLogger(evaluatedProjectName)
    return generateCustomLogger(customLoggerData, evaluatedProjectName, filename)
  }
}