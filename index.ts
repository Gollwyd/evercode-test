import Database from "better-sqlite3";
import { ExpressServer } from "./src/controllers/ExpressServer.ts";
import { firstTaskRunner } from "./src/controllers/FirstTaskRunner.ts";
import { TaskScheduler } from "./src/controllers/Scheduler.ts";
import { CurrencyService } from "./src/services/CurrencyService.ts";
import { CurrencyStorage } from "./src/storages/CurrencyStorage.ts";
import { TaskExample } from "./src/services/Task.ts";
import { Logger } from "./src/utils/Logger.ts";
import { UpdatePriceTask } from "./src/services/UpdatePriceTask.ts";
import { PriceStorage } from "./src/storages/PriceStorage.ts";

const INTERVAL = 10_000;
const UPDATE_PRICE_INTERVAL = 300_000;
const DB_NAME = "currency.db";

const logger = new Logger();
const task = new TaskExample(logger);
const scheduler = new TaskScheduler(logger);
const db = new Database(DB_NAME, {
  verbose: (msg) => logger.info(String(msg)),
});
const currencyStorage = new CurrencyStorage(logger, db);
const priceStorage = new PriceStorage(logger, db);
const currencyService = new CurrencyService(
  logger,
  currencyStorage,
  priceStorage,
);
new ExpressServer(logger, currencyService);

// Task
const updatePriceTask = new UpdatePriceTask(
  priceStorage,
  currencyStorage,
  logger,
);
scheduler.scheduleTask("updatePrice", UPDATE_PRICE_INTERVAL, updatePriceTask);
updatePriceTask.run();

firstTaskRunner(task, scheduler, INTERVAL);
