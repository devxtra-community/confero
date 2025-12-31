type LogLevel = 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, string> = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

const logger = {
  info(message: string): void {
    console.log(formatMessage(LOG_LEVELS.info, message));
  },

  warn(message: string): void {
    console.warn(formatMessage(LOG_LEVELS.warn, message));
  },

  error(message: string): void {
    console.error(formatMessage(LOG_LEVELS.error, message));
  },
};

export default logger;
