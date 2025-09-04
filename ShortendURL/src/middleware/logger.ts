export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];

  private createEntry(level: LogEntry['level'], message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('info', message, context);
    this.logs.push(entry);
    this.persistLogs();
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('warn', message, context);
    this.logs.push(entry);
    this.persistLogs();
  }

  error(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('error', message, context);
    this.logs.push(entry);
    this.persistLogs();
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('debug', message, context);
    this.logs.push(entry);
    this.persistLogs();
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  private persistLogs() {
    try {
      localStorage.setItem('app-logs', JSON.stringify(this.logs));
    } catch (error) {
      // Silently handle localStorage errors
    }
  }

  loadPersistedLogs() {
    try {
      const stored = localStorage.getItem('app-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
  }
}

export const logger = new Logger();
logger.loadPersistedLogs();