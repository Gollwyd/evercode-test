import { ITask } from "../services/Task";
import { ILogger } from "../utils/Logger";

export class TaskScheduler {
  private logger: ILogger;
  private intervalIds = [] as NodeJS.Timeout[];
  constructor(logger: ILogger) {
    this.logger = logger;
    this.logger.info("Scheduler run!");
    process.on("SIGINT", this.shutdown);
    process.on("SIGTERM", this.shutdown);
  }
  private shutdown = () => {
    this.intervalIds.forEach(clearInterval);
  };

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
    const intervalId = setInterval(callBack, interval);
    this.intervalIds.push(intervalId);
    return { stop: () => clearInterval(intervalId) };
  };
}
