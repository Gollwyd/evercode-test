import Database from "better-sqlite3";
import { ExpressServer } from "./src/controllers/ExpressServer.ts";
import { firstTaskRunner } from "./src/controllers/FirstTaskRunner.ts";
import { TaskScheduler } from "./src/controllers/Scheduler.ts";
import { CurrencyService } from "./src/services/CurrencyService.ts";
import { CurrencyStorage } from "./src/storages/CurrencyStorage.ts";
import { TaskExample } from "./src/services/Task.ts";
import { Logger } from "./src/utils/Logger.ts";

const INTERVAL = 10_000;
const DB_NAME = "currency.db";

const logger = new Logger();
const task = new TaskExample(logger);
const scheduler = new TaskScheduler(logger);
const db = new Database(DB_NAME, {
  verbose: (msg) => logger.info(String(msg)),
});
const currencyStorage = new CurrencyStorage(logger, db);
const currencyService = new CurrencyService(logger, currencyStorage);
new ExpressServer(logger, currencyService);

firstTaskRunner(task, scheduler, INTERVAL);
