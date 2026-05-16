import { Logger } from "../utils/Logger";

export class Task {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public run = () => {
    this.logger.log(">> Running task");
  };
}
