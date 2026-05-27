import express from "express";
import {
  Express,
  NextFunction,
  Request,
  Response,
} from "express-serve-static-core";
import swaggerUi from "swagger-ui-express";

import config from "../../config";
import openapiDocument from "../../openapi.json";
import { ILogger } from "../utils/Logger";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { CurrencyService } from "../services/CurrencyService";

export class ExpressServer {
  private server: Express;
  private logger: ILogger;

  constructor(logger: ILogger, currencyService: CurrencyService) {
    this.logger = logger;
    this.server = express();
    this.server.get("/status", (_req, res) => {
      res.send("Ok");
    });

    this.server.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(openapiDocument),
    );
    this.server.use(verifyToken);
    this.server.use(express.json());

    this.server.post("/currency", currencyService.createCurrency);
    this.server.get("/currency/:id", currencyService.getCurrency);
    this.server.put("/currency/:id", currencyService.updateCurrency);
    this.server.delete("/currency/:id", currencyService.deleteCurrency);

    this.server.get("/price/:currency", currencyService.getPrice);

    this.server.listen(config.port, () => {
      this.logger.info(`Server is running on http://localhost:${config.port}`);
    });

    this.server.use((req, _res, next) => {
      logger.info(`${req.method} ${req.url} ${req.get("user-agent")}`);
      next();
    });
  }
}

function verifyToken(req: Request, res: Response, next: NextFunction) {
  if (req.route === "/status") {
    return next();
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden" });
  }
}
