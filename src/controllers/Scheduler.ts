import { ITask } from "../services/Task";
import { ILogger } from "../utils/Logger";

export class TaskScheduler {
  private logger: ILogger;
  constructor(logger: ILogger) {
    this.logger = logger;
    this.logger.info("Scheduler run!");
  }

  public scheduleTask = (name: string, interval: number, task: ITask) => {
    const logString = `(scheduleTask) ${name}() invoked with interval ${interval} in scheduler`;
    const callBack = () => {
      try {
        this.logger.debug(logString);
        task.run();
      } catch (error) {
        const message = error instanceof Error ? error.message : error;
        this.logger.error(`Error executing task "${name}": ${message}`);
      }
    };
    const timerId = setInterval(callBack, interval);
    return { stop: () => clearInterval(timerId) };
  };
}
