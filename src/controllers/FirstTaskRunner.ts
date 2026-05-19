import { ITask } from "../services/Task";
import { ILogger, Logger } from "../utils/Logger";
import { TaskScheduler } from "./Scheduler";

export const firstTaskRunner = (
  task: ITask<ILogger>,
  scheduler: TaskScheduler,
  interval: number = 10_000,
) => {
  const name = "firstTaskRunner";
  scheduler.scheduleTask(name, interval, task);
};
