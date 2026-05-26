import request from "supertest";
import { ExpressServer } from "../ExpressServer";
import { Logger } from "../../utils/Logger";
import { CurrencyService } from "../../services/CurrencyService";
import "dotenv/config";

const token = process.env.JWT_TOKEN;

describe("status endpoint", () => {
  const logger = new Logger();
  const currencyService = new CurrencyService(logger);
  const { server } = new ExpressServer(logger, currencyService);
  it("should return Ok", async () => {
    const res = await request(server).get("/status").send();
    expect(res.text).toEqual("Ok");
  });
});

describe("currency CRUD flow", () => {
  const logger = new Logger();
  const currencyService = new CurrencyService(logger);
  const { server } = new ExpressServer(logger, currencyService);

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
