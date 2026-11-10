type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: LogLevel[] = ["debug", "info", "warn", "error"];

// Default: hide debug/info noise unless a developer opts in; warn/error always show.
let minLevel: LogLevel = "warn";

export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(minLevel);
}

function write(level: LogLevel, scope: string, args: unknown[]): void {
  if (!shouldLog(level)) return;
  const consoleMethod = level === "debug" ? console.debug : level === "info" ? console.log : level === "warn" ? console.warn : console.error;
  consoleMethod(`[${scope}]`, ...args);
}

export function createLogger(scope: string) {
  return {
    debug: (...args: unknown[]) => write("debug", scope, args),
    info: (...args: unknown[]) => write("info", scope, args),
    warn: (...args: unknown[]) => write("warn", scope, args),
    error: (...args: unknown[]) => write("error", scope, args),
  };
}
