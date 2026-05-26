import { ExpressServer } from "./src/controllers/ExpressServer.ts";
import { firstTaskRunner } from "./src/controllers/FirstTaskRunner.ts";
import { TaskScheduler } from "./src/controllers/Scheduler.ts";
import { CurrencyService } from "./src/services/CurrencyService.ts";
import { TaskExample } from "./src/services/Task.ts";
import { Logger } from "./src/utils/Logger.ts";

const INTERVAL = 10_000;

const logger = new Logger();
const task = new TaskExample(logger);
const scheduler = new TaskScheduler(logger);
const currencyService = new CurrencyService(logger);
new ExpressServer(logger, currencyService);

firstTaskRunner(task, scheduler, INTERVAL);
