import { getPrefix, LogLevel } from "../Logger";

describe("getPrefix", () => {
  const time = new Date().toISOString();
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(time));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const traceId = "123456789";

  it("should return correct prefix with traceId", () => {
    expect(getPrefix(LogLevel.DEBUG, traceId)).toBe(
      `[${time}] [debug] (Evercode Lab App) [${traceId}] `,
    );
  });
  it("should return correct prefix without traceId", () => {
    expect(getPrefix(LogLevel.ERROR)).toBe(
      `[${time}] [error] (Evercode Lab App) `,
    );
  });
});
