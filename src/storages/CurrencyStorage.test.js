import Database from "better-sqlite3";
import { CurrencyStorage } from "./CurrencyStorage";
import { Logger } from "../utils/Logger";

let сurrencyStorage;

beforeAll(async () => {
  const db = new Database(":memory:", {
    verbose: console.log,
  });
  const logger = new Logger();
  сurrencyStorage = new CurrencyStorage(logger, db);
});

describe("сurrencyStorage", () => {
  const currencyId = "3cd89693-304e-4a9a-a1b7-3aa6dea9041b";
  const currency = {
    id: currencyId,
    name: "Bitcoin",
    ticker: "BTC",
  };
  const updatedCurrency = { id: currencyId, name: "BITCOIN", ticker: "BTC" };
  it("createAndGet should return created currency ", async () => {
    const result = сurrencyStorage.createAndGet(currency);
    expect(String(result)).toEqual(String(currency));
  });
  it("get should return created currency ", async () => {
    const result = сurrencyStorage.get(currencyId);
    expect(String(result)).toEqual(String(currency));
  });
  it("updateAndGet should return correct new currency ", async () => {
    const result = сurrencyStorage.updateAndGet(updatedCurrency);
    expect(String(result)).toEqual(String(updatedCurrency));
  });
  it("get should return correct new currency after update", async () => {
    const updatedCurrency = { id: currencyId, name: "BITCOIN", ticker: "BTC" };
    const result = сurrencyStorage.get(currencyId);
    expect(String(result)).toEqual(String(updatedCurrency));
  });

  it("get after delete should not return created currency ", async () => {
    сurrencyStorage.getAndDelete(currencyId);
    const result = сurrencyStorage.get(currencyId);
    expect(result).toBeUndefined();
  });
});
