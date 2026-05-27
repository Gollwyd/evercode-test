import { Request, Response } from "express-serve-static-core";
import { v4 } from "uuid";
import { ILogger } from "../utils/Logger";
import axios from "axios";
import { AppError } from "../errors/AppError";

type Currency = { id: string; name: string; ticker: string };

export class CurrencyService {
  currencies: Array<Currency> = [];
  logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  createCurrency = (req: Request, res: Response) => {
    console.log(req);
    const { name, ticker } = req.body;

    if (!name || !ticker) {
      return res.status(400).json({ error: "Name and ticker are required" });
    }

    const currency = { id: v4(), name, ticker };
    this.currencies.push(currency);
    res.status(201).json(currency);
  };

  getCurrency = (req: Request, res: Response) => {
    const currency = this.currencies.find((c) => c.id == req.params.id);
    if (!currency) return res.status(404).json({ error: "Currency not found" });
    res.json(currency);
  };

  getPrice = async (req: Request, res: Response) => {
    const currency = req.params.currency as string;
    if (!currency) {
      return res.status(404).json({ error: "Currency cant be empty" });
    }
    const isTickerExist = !!this.currencies.find(
      (c) => c.ticker == req.params.currency,
    );
    if (!isTickerExist) {
      return res.status(404).json({ error: "Currency not found" });
    }
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/price",
        {
          timeout: 5000,
        },
      );
      if (!Array.isArray(response.data)) {
        throw new AppError("Wrong data received");
      }
      const array = response.data as Array<{ symbol: string; price: string }>;

      const result = array.filter(({ symbol }) => symbol.startsWith(currency));
      res.json(result);
    } catch (e) {
      if (e instanceof AppError) {
        this.logger.error(e.message);
      }
      this.logger.error("Internal error");
      return res.status(500).json({ error: "Internal error" });
    }

    if (!currency) res.json(currency);
  };

  updateCurrency = (req: Request, res: Response) => {
    const { id } = req.params;
    const index = this.currencies.findIndex((c) => c.id === id);

    if (index === -1)
      return res.status(404).json({ error: "Currency not found" });

    const { name, ticker } = req.body;
    this.currencies[index] = { ...this.currencies[index], name, ticker };
    res.json(this.currencies[index]);
  };

  deleteCurrency = (req: Request, res: Response) => {
    const index = this.currencies.findIndex((c) => c.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Currency not found" });

    this.currencies.splice(index, 1);
    res.status(204).send();
  };
}
