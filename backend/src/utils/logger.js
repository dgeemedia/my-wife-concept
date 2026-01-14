//
const { SERVER } = require('../config/constants');

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';

  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
}

/**
 * Logger class
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  log(level, message, meta = {}) {
    const fullMessage = formatLogMessage(level, `[${this.context}] ${message}`, meta);

    if (SERVER.NODE_ENV === 'production') {
      // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
      console.log(fullMessage);
    } else {
      // In development, use colored console output
      switch (level) {
        case LogLevel.ERROR:
          console.error(fullMessage);
          break;
        case LogLevel.WARN:
          console.warn(fullMessage);
          break;
        case LogLevel.INFO:
          console.info(fullMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(fullMessage);
          break;
        default:
          console.log(fullMessage);
      }
    }
  }

  error(message, meta) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message, meta) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message, meta) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message, meta) {
    if (SERVER.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
}

/**
 * Create logger instance
 */
function createLogger(context) {
  return new Logger(context);
}

module.exports = {
  Logger,
  createLogger,
  LogLevel,
};
