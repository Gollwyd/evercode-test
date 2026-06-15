import Database, { Statement } from "better-sqlite3";

import { ILogger } from "../utils/Logger";

export type Price = { symbol: string; price: string };
export type PriceHistory = { symbol: string; price: string; date: number };
export type PriceHistoryRow = { price: string; date: number };

export interface IPriceStorage {
  find: (symbol: string) => Price[];
  updateAllRecords: (p: Price[]) => void;
}

export class PriceStorage implements IPriceStorage {
  private db: Database.Database;
  private logger: ILogger;

  public updateAllRecords: (p: Price[]) => void;

  findStmt: Database.Statement;
  createStmt: Database.Statement;
  addToHistoryStmt: Database.Statement;
  findHistoryStmt: Database.Statement;

  constructor(logger: ILogger, db: Database.Database) {
    this.logger = logger;
    this.db = db;

    db.exec(`CREATE TABLE IF NOT EXISTS prices (
      symbol TEXT NOT NULL,
      price TEXT NOT NULL
    )
  `);

    db.exec(`CREATE TABLE IF NOT EXISTS price_history (
      symbol TEXT NOT NULL,
      price TEXT NOT NULL,
      date INTEGER NOT NULL 
    );
  `);

    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol)`,
    );

    this.createStmt = this.db.prepare(
      "INSERT INTO prices (symbol, price) VALUES (@symbol, @price)",
    ) as Statement<Price>;
    this.addToHistoryStmt = this.db.prepare(
      "INSERT INTO price_history (symbol, price, date) VALUES (@symbol, @price, @date)",
    ) as Statement<Price>;
    this.findStmt = this.db.prepare(
      "SELECT * FROM prices WHERE SUBSTR(symbol, 1, LENGTH(@symbol)) = @symbol",
    );
    this.findHistoryStmt = this.db.prepare(
      "SELECT * FROM price_history WHERE SUBSTR(symbol, 1, LENGTH(@symbol)) = @symbol",
    );

    this.updateAllRecords = this.db.transaction((prices: Price[]) => {
      db.exec("DELETE FROM prices");
      const date = Date.now();
      for (const item of prices) {
        this.create(item);
        this.addToHistory({ ...item, date });
      }
    });
    this.logger.info("PriceStorage ready!");
  }

  private create = (price: Price) => this.createStmt.run(price);
  private addToHistory = (price: PriceHistory) =>
    this.addToHistoryStmt.run(price);

  public find = (symbol: string): Price[] =>
    this.findStmt.all({ symbol }) as Price[];

  public getHistory = (symbol: string): Record<string, PriceHistoryRow[]> => {
    const prices = this.findHistoryStmt.all({ symbol }) as PriceHistory[];
    const result = {} as Record<string, PriceHistoryRow[]>;

    prices.forEach((priceRecord: PriceHistory) => {
      const { price, symbol, date } = priceRecord;
      if (symbol in result) {
        result[symbol].push({ price, date });
      } else {
        result[symbol] = [{ price, date }];
      }
    });
    return result;
  };
}
