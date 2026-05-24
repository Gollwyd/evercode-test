import express from "express";
import { Express } from "express-serve-static-core";
import config from "../../config";
import { ILogger } from "../utils/Logger";

export class ExpressServer {
  private server: Express;
  private logger: ILogger;
  constructor(logger: ILogger) {
    this.logger = logger;
    this.server = express();
    this.server.get("/status", (_req, res) => {
      res.send("Ok");
    });

    this.server.listen(config.port, () => {
      this.logger.info(`Server is running on http://localhost:${config.port}`);
    });

    this.server.use((req, _res, next) => {
      logger.info(`${req.method} ${req.url} ${req.get("user-agent")}`);
      next();
    });
  }
}
