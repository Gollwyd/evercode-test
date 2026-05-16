import { Task } from "../services/Task";
import { Logger } from "../utils/Logger";
import { TaskScheduler } from "./Scheduler";

export const firstTaskRunner = () => {
  const { name } = firstTaskRunner;
  const interval = 10_000;
  const logger = new Logger();
  const task = new Task(logger);
  const scheduler = new TaskScheduler(logger);
  scheduler.scheduleTask(name, interval, task);
};
