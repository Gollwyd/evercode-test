import { log } from "./logger.ts";

log("Scheduler run!");

export const scheduleTask = (
  name: string,
  interval: number,
  task: () => void,
) => {
  const logString = `(scheduleTask) ${name}() invoked with interval ${interval} in scheduler`;
  const callBack = () => {
    log(logString);
    task();
  };
  const timerId = setInterval(callBack, interval);
  return { stop: () => clearInterval(timerId) };
};
