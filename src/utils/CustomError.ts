type ErrorContext = Record<string, any>;

export class CustomError extends Error {
  public readonly timestamp: string;
  public readonly context?: ErrorContext;
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, context?: ErrorContext) {
    super(message);

    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }
}
