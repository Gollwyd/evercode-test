import { ITask } from "../services/Task";
import { TaskScheduler } from "./Scheduler";

export const firstTaskRunner = (
  task: ITask,
  scheduler: TaskScheduler,
  interval: number = 10_000,
) => {
  const name = "firstTaskRunner";
  scheduler.scheduleTask(name, interval, task);
};
