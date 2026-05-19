import config from "../../config.ts";

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

const LogLevelName: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "trace",
  [LogLevel.DEBUG]: "debug",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error",
};

export interface ILogger {
  trace(...arg: any): void;
  debug(...arg: any): void;
  info(...arg: any): void;
  warn(...arg: any): void;
  error(...arg: any): void;
}

export const getPrefix = (logLevel: LogLevel, requestId?: string) => {
  const { appName } = config;
  const time = new Date().toISOString();
  const logLevelName = LogLevelName[logLevel];
  let prefix = `[${time}] [${logLevelName}] (${appName})`;
  if (requestId) {
    prefix = `${prefix} [${requestId}]`;
  }
  return prefix + " ";
};

const getConsoleLog = (logLevel: LogLevel) => {
  if (logLevel === LogLevel.ERROR) {
    return console.error;
  } else if (logLevel === LogLevel.WARN) {
    return console.warn;
  }
  return console.log;
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
