import { Task } from "../services/Task";
import { Logger } from "../utils/Logger";

export class TaskScheduler {
  private logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
    this.logger.log("Scheduler run!");
  }

  public scheduleTask = (name: string, interval: number, task: Task) => {
    const logString = `(scheduleTask) ${name}() invoked with interval ${interval} in scheduler`;
    const callBack = () => {
      this.logger.log(logString);
      task.run();
    };
    const timerId = setInterval(callBack, interval);
    return { stop: () => clearInterval(timerId) };
  };
}
