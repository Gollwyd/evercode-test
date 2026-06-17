import request from "supertest";
import { ExpressServer } from "../ExpressServer";
import { Logger } from "../../utils/Logger";
import { CurrencyService } from "../../services/CurrencyService";
import "dotenv/config";
import Database from "better-sqlite3";
import { CurrencyStorage } from "../../storages/CurrencyStorage";
import { PriceStorage } from "../../storages/PriceStorage";

const token = process.env.JWT_TOKEN;
let server;
let priceStorage;
let сurrencyStorage;
beforeAll(() => {
  const logger = new Logger();
  const db = new Database(":memory:", {
    verbose: (...arg) => logger.info(...arg),
  });

  сurrencyStorage = new CurrencyStorage(logger, db);
  priceStorage = new PriceStorage(logger, db);
  const currencyService = new CurrencyService(
    logger,
    сurrencyStorage,
    priceStorage,
  );
  const { server: expressServer } = new ExpressServer(logger, currencyService);

  server = expressServer;
});

describe("status endpoint", () => {
  it("should return Ok", async () => {
    const res = await request(server).get("/status").send();
    expect(res.text).toEqual("Ok");
  });
});

describe("price endpoint", () => {
  it("should return price for created prices", async () => {
    сurrencyStorage.create({ id: "fsdf", name: "Bitcoin", ticker: "BTC" });
    priceStorage.create({ symbol: "BTCTUSD", price: "74718" });

    const res = await request(server)
      .get("/price/BTC")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.body).toEqual([{ symbol: "BTCTUSD", price: "74718" }]);
  });

  it("should return price only for compatible ticker", async () => {
    priceStorage.create({ symbol: "BTCTDD", price: "78888" });
    priceStorage.create({ symbol: "BCCCTUSD", price: "74718" });
    const res = await request(server)
      .get("/price/BTC")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.body.length).toEqual(2);
  });
});

describe("history endpoint", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it("should return price for created prices", async () => {
    const time1 = new Date(1705312800000);
    const time2 = new Date(1736935200000);
    jest.setSystemTime(time1);
    priceStorage.addToHistory({
      symbol: "BTCTUSD",
      price: "74718",
      date: time1.getTime(),
    });
    jest.setSystemTime(time1);
    priceStorage.addToHistory({
      symbol: "BTCTUSD",
      price: "747888",
      date: time2.getTime(),
    });
    const res = await request(server)
      .get("/history/BTC")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.body).toEqual({
      BTCTUSD: [
        { date: 1705312800000, price: "74718" },
        { date: 1736935200000, price: "747888" },
      ],
    });
  });
});

describe("currency CRUD flow", () => {
  let createdCurrency;

  it("should create currency", async () => {
    const res = await request(server)
      .post("/currency")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bitcoin",
        ticker: "BTC",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Bitcoin");
    expect(res.body.ticker).toBe("BTC");

    createdCurrency = res.body;
  });

  it("should get created currency", async () => {
    const res = await request(server)
      .get(`/currency/${createdCurrency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdCurrency.id);
  });

  it("should update currency", async () => {
    const res = await request(server)
      .put(`/currency/${createdCurrency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ethereum",
        ticker: "ETH",
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ethereum");
    expect(res.body.ticker).toBe("ETH");
  });

  it("should get updated currency", async () => {
    const res = await request(server)
      .get(`/currency/${createdCurrency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ethereum");
    expect(res.body.ticker).toBe("ETH");
  });

  it("should delete currency", async () => {
    const res = await request(server)
      .delete(`/currency/${createdCurrency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(204);
  });

  it("should return 404 after delete", async () => {
    const res = await request(server)
      .get(`/currency/${createdCurrency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(404);
  });
});
