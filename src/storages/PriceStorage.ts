import Database, { Statement } from "better-sqlite3";

import { ILogger } from "../utils/Logger";

export type Price = { symbol: string; price: string };

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

  constructor(logger: ILogger, db: Database.Database) {
    this.logger = logger;
    this.db = db;

    db.exec(`CREATE TABLE IF NOT EXISTS prices (
      symbol TEXT NOT NULL,
      price TEXT NOT NULL
    )
  `);

    this.createStmt = this.db.prepare(
      "INSERT INTO prices (symbol, price) VALUES (@symbol, @price)",
    ) as Statement<Price>;
    this.findStmt = this.db.prepare(
      "SELECT * FROM prices WHERE SUBSTR(symbol, 1, LENGTH(@symbol)) = @symbol",
    );

    this.updateAllRecords = this.db.transaction((prices: Price[]) => {
      db.exec("DELETE FROM prices");
      for (const item of prices) {
        this.create(item);
      }
    });
  }

  private create = (price: Price) => this.createStmt.run(price);

  public find = (symbol: string): Price[] =>
    this.findStmt.all({ symbol }) as Price[];
}
