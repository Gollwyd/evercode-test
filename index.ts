import { ExpressServer } from "./src/controllers/ExpressServer.ts";
import { firstTaskRunner } from "./src/controllers/FirstTaskRunner.ts";
import { TaskScheduler } from "./src/controllers/Scheduler.ts";
import { TaskExample } from "./src/services/Task.ts";
import { Logger } from "./src/utils/Logger.ts";

const INTERVAL = 10_000;

const logger = new Logger();
const task = new TaskExample(logger);
const scheduler = new TaskScheduler(logger);
new ExpressServer(logger);

firstTaskRunner(task, scheduler, INTERVAL);
