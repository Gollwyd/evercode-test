import request from "supertest";
import { ExpressServer } from "../ExpressServer";
import { Logger } from "../../utils/Logger";

describe("status endpoint", () => {
  const logger = new Logger();
  const { server } = new ExpressServer(logger);
  it("should return Ok", async () => {
    const res = await request(server).get("/status").send();
    expect(res.text).toEqual("Ok");
  });
});
