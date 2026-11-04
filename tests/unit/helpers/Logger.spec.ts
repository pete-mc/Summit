import { createLogger, setLogLevel } from "@/helpers/Logger";

describe("Logger", () => {
  afterEach(() => {
    setLogLevel("warn");
    jest.restoreAllMocks();
  });

  it("prefixes output with the scope", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const logger = createLogger("myScope");

    logger.error("something broke");

    expect(errorSpy).toHaveBeenCalledWith("[myScope]", "something broke");
  });

  it("suppresses debug and info by default", () => {
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const logger = createLogger("myScope");

    logger.debug("trace detail");
    logger.info("informational");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("allows warn and error by default", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const logger = createLogger("myScope");

    logger.warn("careful");
    logger.error("failure");

    expect(warnSpy).toHaveBeenCalledWith("[myScope]", "careful");
    expect(errorSpy).toHaveBeenCalledWith("[myScope]", "failure");
  });

  it("setLogLevel('debug') allows every level through", () => {
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const logger = createLogger("myScope");

    setLogLevel("debug");
    logger.debug("trace detail");
    logger.info("informational");

    expect(debugSpy).toHaveBeenCalledWith("[myScope]", "trace detail");
    expect(logSpy).toHaveBeenCalledWith("[myScope]", "informational");
  });
});
