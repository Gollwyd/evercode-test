import config from "./config.ts";

export const log = (...arg: any[]) => {
  const { appName } = config;
  const time = new Date().toISOString();
  const prefix = `[${time}] (${appName}) `;
  console.log(prefix, ...arg);
};
