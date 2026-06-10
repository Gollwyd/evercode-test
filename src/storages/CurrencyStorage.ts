import Database from "better-sqlite3";

import { ILogger } from "../utils/Logger";

export interface IStorage<T> {
  get: (id: string) => T;
  find: (ticker: string) => T;

  updateAndGet: (c: T) => T;
  createAndGet: (a: T) => void;
  getAndDelete: (id: string) => boolean;
}

export type Currency = { id: string; name: string; ticker: string };

export class CurrencyStorage implements IStorage<Currency> {
  private db: Database.Database;
  private logger: ILogger;

  public createAndGet: (c: Currency) => Currency;
  public updateAndGet: (c: Currency) => Currency;
  public getAndDelete: (id: string) => boolean;

  getStmt: Database.Statement;
  findStmt: Database.Statement;
  updateStmt: Database.Statement;
  deleteStmt: Database.Statement;
  createStmt: Database.Statement;
  getAllStmt: Database.Statement;

  constructor(logger: ILogger, db: Database.Database) {
    this.logger = logger;
    this.db = db;
    db.exec(`CREATE TABLE IF NOT EXISTS currencies (
      id TEXT UNIQUE,
      name TEXT NOT NULL,
      ticker TEXT NOT NULL
    )
  `);

    this.getStmt = this.db.prepare("SELECT * FROM currencies WHERE id = ?");
    this.getAllStmt = this.db.prepare("SELECT * FROM currencies");
    this.createStmt = this.db.prepare(
      "INSERT INTO currencies (id, name, ticker) VALUES (@id, @name, @ticker)",
    );
    this.findStmt = this.db.prepare(
      "SELECT * FROM currencies WHERE ticker = ?",
    );
    this.updateStmt = this.db.prepare(
      "UPDATE currencies SET name = @name, ticker = @ticker WHERE id = @id",
    );
    this.deleteStmt = this.db.prepare("DELETE FROM currencies WHERE id = ?");

    this.createAndGet = this.db.transaction((currency: Currency) => {
      this.create(currency);
      return this.get(currency.id);
    });

    this.updateAndGet = this.db.transaction((currency: Currency) => {
      this.update(currency);
      return this.get(currency.id);
    });

    this.getAndDelete = this.db.transaction((id: string) => {
      const c = this.get(id);
      if (!c) return false;
      this.delete(id);

      return true;
    });

    this.logger.info("CurrencyStorage ready!");
  }

  private create = (currency: Currency) => this.createStmt.run(currency);
  get = (id: string): Currency => this.getStmt.get(id) as Currency;
  find = (ticker: string): Currency => this.findStmt.get(ticker) as Currency;
  getTickers = () =>
    this.getAllStmt.all().map((c) => (c as Currency).ticker) as string[];
  private update = (currency: Currency) => this.updateStmt.run(currency);
  private delete = (id: string) => this.deleteStmt.run(id);
}
