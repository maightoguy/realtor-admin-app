type LogLevel = "log" | "info" | "warn" | "error";

class Logger {
  private enabled = import.meta.env.DEV;

  private logInternal(level: LogLevel, ...args: unknown[]) {
    if (!this.enabled) return;
    (console[level] as (...a: unknown[]) => void)(...args);
  }

  log(...args: unknown[]) {
    this.logInternal("log", ...args);
  }

  info(...args: unknown[]) {
    this.logInternal("info", "[INFO]", ...args);
  }

  warn(...args: unknown[]) {
    this.logInternal("warn", "[WARN]", ...args);
  }

  error(...args: unknown[]) {
    this.logInternal("error", "[ERROR]", ...args);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const logger = new Logger();
