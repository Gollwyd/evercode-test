import Database from "better-sqlite3";
import { CurrencyStorage } from "./CurrencyStorage";
import { PriceStorage } from "./PriceStorage";
import { Logger } from "../utils/Logger";

let priceStorage;
let db;

beforeAll(() => {
  const logger = new Logger();
  db = new Database(":memory:", {
    verbose: console.log,
  });
  priceStorage = new PriceStorage(logger, db);
});

beforeEach(() => {
  db.exec("DELETE FROM prices");
});

describe("priceStorage price table", () => {
  it("find should return item with desired symbol", () => {
    priceStorage.create({ symbol: "BTCTUSD", price: "74718" });
    priceStorage.create({ symbol: "ETHUSD", price: "542" });

    expect(priceStorage.find("BTC")).toHaveLength(1);
    expect(priceStorage.find("BTC")[0].symbol).toBe("BTCTUSD");
    expect(priceStorage.find("XYZ")).toHaveLength(0);
  });

  it("updateAllRecords should remove items before saving new", () => {
    priceStorage.create({ symbol: "BTCTUSD", price: "74718" });
    priceStorage.create({ symbol: "ETHUSD", price: "542" });

    const newPrices = [
      { symbol: "USDBTC", price: "3263" },
      { symbol: "EURBTC", price: "6544" },
    ];

    priceStorage.updateAllRecords(newPrices);

    const updated = db.prepare("SELECT * FROM prices").all();
    expect(updated).toEqual(newPrices);
  });
});

describe("priceStorage price_history table", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  beforeEach(() => {
    db.exec("DELETE FROM price_history");
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("getHistory should return all rows for desired symbol", () => {
    priceStorage.addToHistory({
      symbol: "BTCTUSD",
      price: "74718",
      date: Date.now(),
    });
    priceStorage.addToHistory({
      symbol: "BTCTUSD",
      price: "542",
      date: Date.now(),
    });

    expect(priceStorage.getHistory("BTC")["BTCTUSD"]).toHaveLength(2);
  });

  it("updateAllRecords should write items for history and get record should return relevant object", () => {
    const oldPrices = [
      { symbol: "USDETH", price: "111" },
      { symbol: "USDBTC", price: "222" },
    ];
    const time1 = new Date("2024-01-15T10:00:00Z");
    jest.setSystemTime(time1);

    priceStorage.updateAllRecords(oldPrices);

    const newPrices = [
      { symbol: "USDETH", price: "333" },
      { symbol: "USDBTC", price: "444" },
    ];
    const time2 = new Date("2025-01-15T10:00:00Z");
    jest.setSystemTime(time2);

    priceStorage.updateAllRecords(newPrices);

    const history = priceStorage.getHistory("USD");

    const result = {
      USDETH: [
        { date: time1.getTime(), price: "111" },
        { date: time2.getTime(), price: "333" },
      ],
      USDBTC: [
        { date: time1.getTime(), price: "222" },
        { date: time2.getTime(), price: "444" },
      ],
    };
    expect(history).toEqual(result);
  });
});
