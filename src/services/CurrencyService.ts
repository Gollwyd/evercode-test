import { Request, Response } from "express-serve-static-core";
import { v4 } from "uuid";
import { ILogger } from "../utils/Logger";

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
