import axios from "axios";
import { AppError } from "../errors/AppError";
import { ILogger } from "../utils/Logger";
import { PriceStorage } from "../storages/PriceStorage";
import { CurrencyStorage } from "../storages/CurrencyStorage";

const CURRENCY_ENDPOINT = "https://api.binance.com/api/v3/ticker/price";

export interface ITask {
  run(): void;
}

export class UpdatePriceTask implements ITask {
  private logger: ILogger;
  private priceStorage: PriceStorage;
  private currencyStorage: CurrencyStorage;

  constructor(
    priceStorage: PriceStorage,
    currencyStorage: CurrencyStorage,
    logger: ILogger,
  ) {
    this.logger = logger;
    this.priceStorage = priceStorage;
    this.currencyStorage = currencyStorage;
  }

  public run = async (times = 0) => {
    this.logger.info("Running UpdatePriceTask");
    let response;
    try {
      response = await axios.get(CURRENCY_ENDPOINT, {
        timeout: 5000,
      });
    } catch {
      if (times > 5) {
        this.logger.error("Impossible perform UpdateTask");
      } else {
        this.logger.warn(`Error on request currency, retry count: ${times}`);
        this.run(++times);
      }
      return;
    }

    if (!Array.isArray(response.data)) {
      throw new AppError("Wrong data received");
    }
    const array = response.data as Array<{ symbol: string; price: string }>;
    const tickers = this.currencyStorage.getTickers();
    const filteredPrices = array.filter(
      ({ symbol }) => !!tickers.find((ticker) => symbol.startsWith(ticker)),
    );
    this.priceStorage.updateAllRecords(filteredPrices);
  };
}
