/* eslint-disable @typescript-eslint/no-explicit-any */
// Central Logger Utility
// Can be easily enabled/disabled for production

type LogLevel = 'log' | 'info' | 'warn' | 'error';

class Logger {
    private enabled = import.meta.env.DEV; // true in dev, false in production

    private logInternal(level: LogLevel, ...args: any[]) {
        if (!this.enabled) return;
        console[level](...args);
    }

    log(...args: any[]) {
        this.logInternal('log', ...args);
    }

    info(...args: any[]) {
        this.logInternal('info', '[INFO]', ...args);
    }

    warn(...args: any[]) {
        this.logInternal('warn', '[WARN]', ...args);
    }

    error(...args: any[]) {
        this.logInternal('error', '[ERROR]', ...args);
    }

    // Call this anywhere to turn logging on even in production (for debugging)
    enable() {
        this.enabled = true;
    }

    // Call this to turn logging off
    disable() {
        this.enabled = false;
    }

    // Check if logging is enabled
    isEnabled(): boolean {
        return this.enabled;
    }
}

export const logger = new Logger();

