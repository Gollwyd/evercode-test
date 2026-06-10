import Database from "better-sqlite3";
import { CurrencyStorage } from "./CurrencyStorage";
import { PriceStorage } from "./PriceStorage";

let priceStorage;
let db;

beforeAll(() => {
  db = new Database(":memory:", {
    verbose: console.log,
  });
  priceStorage = new PriceStorage(console.log, db);
});

beforeEach(() => {
  db.exec("DELETE FROM prices");
});

describe("priceStorage", () => {
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
