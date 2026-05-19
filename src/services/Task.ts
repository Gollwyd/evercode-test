import { RandomError } from "../errors/AppError";
import { ILogger } from "../utils/Logger";

export interface ITask {
  run(): void;
}

export class TaskExample implements ITask {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public run = () => {
    this.logger.info("Running task");
    if (Math.random() > 0.8) {
      throw new RandomError("Random number in TasExample more then 0.8!!!");
    }
  };
}
