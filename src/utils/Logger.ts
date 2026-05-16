import config from "../../config.ts";

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

enum LogLevelName {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

const getLogLevelName = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.TRACE:
      return LogLevelName.TRACE;
    case LogLevel.DEBUG:
      return LogLevelName.DEBUG;
    case LogLevel.INFO:
      return LogLevelName.INFO;
    case LogLevel.WARN:
      return LogLevelName.WARN;
    case LogLevel.ERROR:
      return LogLevelName.ERROR;
    default:
      break;
  }
};

const getPrefix = (logLevel: LogLevel, requestId?: string) => {
  const { appName } = config;
  const time = new Date().toISOString();
  const logLevelName = getLogLevelName(logLevel);
  let prefix = `[${time}] [${logLevelName}] (${appName})`;
  if (requestId) {
    prefix = `${prefix} ${requestId}`;
  }
  return prefix + " ";
};

const getConsoleLog = (logLevel: LogLevel) => {
  if (logLevel === LogLevel.ERROR) {
    return (...arg: any) => console.error(...arg);
  } else if (logLevel === LogLevel.WARN) {
    return (...arg: any) => console.warn(...arg);
  }

  return (...arg: any) => console.log(...arg);
};

export interface LogContext {
  requestId?: string;
}

export class Logger {
  private log(level: LogLevel, message: string, requestId?: string) {
    if (level < config.logLevel) {
      return;
    }
    const prefix = getPrefix(level, requestId);
    const consoleLog = getConsoleLog(level);
    consoleLog(prefix + message);
  }

  public trace(msg: string, requestId?: string) {
    this.log(LogLevel.TRACE, msg, requestId);
  }
  public debug(msg: string, requestId?: string) {
    this.log(LogLevel.DEBUG, msg, requestId);
  }
  public info(msg: string, requestId?: string) {
    this.log(LogLevel.INFO, msg, requestId);
  }
  public warn(msg: string, requestId?: string) {
    this.log(LogLevel.WARN, msg, requestId);
  }
  public error(msg: string, requestId?: string) {
    this.log(LogLevel.ERROR, msg, requestId);
  }
}

export const logger = new Logger();
