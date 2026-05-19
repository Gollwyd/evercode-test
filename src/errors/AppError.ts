export type ErrorContext = Record<string, any>;

export class AppError extends Error {
  public readonly timestamp: string;
  public readonly context?: ErrorContext;
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, context?: ErrorContext) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RandomError extends AppError {
  public readonly timestamp: string;
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 500;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
