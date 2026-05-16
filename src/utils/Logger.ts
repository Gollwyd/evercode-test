import config from "../../config.ts";

export class Logger {
  public log = (...arg: any[]) => {
    const { appName } = config;
    const time = new Date().toISOString();
    const prefix = `[${time}] (${appName}) `;
    console.log(prefix, ...arg);
  };
}
