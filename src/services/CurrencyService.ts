import { Request, Response } from "express-serve-static-core";
import { v4 } from "uuid";
import { ILogger } from "../utils/Logger";
import axios from "axios";
import { AppError } from "../errors/AppError";
import { Currency, IStorage } from "../storages/CurrencyStorage";
import { PriceStorage } from "../storages/PriceStorage";

const isString = (arg?: any): arg is string => typeof arg === "string";
export class CurrencyService {
  logger: ILogger;
  currencyStorage: IStorage<Currency>;
  priceStorage: PriceStorage;

  constructor(
    logger: ILogger,
    currencyStorage: IStorage<Currency>,
    priceStorage: PriceStorage,
  ) {
    this.logger = logger;
    this.currencyStorage = currencyStorage;
    this.priceStorage = priceStorage;
  }

  createCurrency = (req: Request, res: Response) => {
    const { name, ticker } = req.body;

    if (!name || !ticker) {
      return res.status(400).json({ error: "Name and ticker are required" });
    }

    const currency = { id: v4(), name, ticker };
    const currencyRes = this.currencyStorage.createAndGet(currency);
    res.status(201).json(currencyRes);
  };

  getCurrency = (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isString(id)) {
      return res.status(400).json({ error: "Id required" });
    }
    const currency = this.currencyStorage.get(id);
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }
    res.status(200).json(currency);
  };

  getPrice = async (req: Request, res: Response) => {
    const currency = req.params.currency as string;
    if (!currency) {
      return res.status(404).json({ error: "Currency cant be empty" });
    }
    const isTickerExist = !!this.currencyStorage.find(currency);
    if (!isTickerExist) {
      return res.status(404).json({ error: "Currency not found" });
    }
    try {
      const result = this.priceStorage.find(currency);
      res.json(result);
    } catch (e) {
      if (e instanceof AppError) {
        this.logger.error(e.message);
      }
      this.logger.error("Internal error", e);
      return res.status(500).json({ error: "Internal error" });
    }

    if (!currency) res.json(currency);
  };

  updateCurrency = (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isString(id)) {
      return res.status(400).json({ error: "Id required" });
    }
    const currencyInDB = this.currencyStorage.get(id);

    if (!currencyInDB)
      return res.status(404).json({ error: "Currency not found" });

    const { name, ticker } = req.body;
    const currency = { ...currencyInDB, name, ticker };
    const newCurrency = this.currencyStorage.updateAndGet(currency);
    if (!newCurrency) {
      return res.status(502).json({ error: "Internal Error" });
    }
    res.status(200).json(newCurrency);
  };

  deleteCurrency = (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isString(id)) {
      return res.status(400).json({ error: "Id required" });
    }

    const result = this.currencyStorage.getAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Currency not found" });
    }

    res.status(204).send();
  };
}
