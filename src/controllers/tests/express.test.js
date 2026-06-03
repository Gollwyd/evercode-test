import request from "supertest";
import { ExpressServer } from "../ExpressServer";
import { Logger } from "../../utils/Logger";
import { CurrencyService } from "../../services/CurrencyService";
import "dotenv/config";
import Database from "better-sqlite3";
import { CurrencyStorage } from "../../storages/CurrencyStorage";

const token = process.env.JWT_TOKEN;
let server;
beforeAll(() => {
  const logger = new Logger();
  const db = new Database(":memory:", {
    verbose: (...arg) => logger.info(...arg),
  });

  const сurrencyStorage = new CurrencyStorage(logger, db);
  const currencyService = new CurrencyService(logger, сurrencyStorage);
  const { server: expressServer } = new ExpressServer(logger, currencyService);

  server = expressServer;
});

describe("status endpoint", () => {
  it("should return Ok", async () => {
    const res = await request(server).get("/status").send();
    expect(res.text).toEqual("Ok");
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
