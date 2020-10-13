type TransportLevel = "none" | "critical" | "error" | "warn" | "notice" | "info" | "debug" | "verbose" | "silly"

interface LoggerTransport {
  level: TransportLevel,
}
interface LoggerTransports {
  console: LoggerTransport,
  file:    LoggerTransport | null,
}

type LogGetter = (filename:string, individialLogger?: boolean) => Logger

interface LoggerConfig {
  setFileLogging:  (state: boolean) => void,
  setLevel:        (level: TransportLevel) => void,
  setConsoleLevel: (level: TransportLevel) => void,
  setFileLevel:    (level: TransportLevel) => void,

  getTransportForLogger: (loggerId) => LoggerTransports | undefined,
  getLoggerIds: () => string[]
}


interface Logger {
  _logger:     any,
  config:      LoggerConfig,
  transports:  LoggerTransports,

  none:        (...log: any[]) => void,
  critical:    (...log: any[]) => void,
  error:       (...log: any[]) => void,
  warn:        (...log: any[]) => void,
  notice:      (...log: any[]) => void,
  info:        (...log: any[]) => void,
  debug:       (...log: any[]) => void,
  verbose:     (...log: any[]) => void,
  silly:       (...log: any[]) => void,
}

type _logGetter = (logger: any, filename: string) => ((...args: any[]) => void);