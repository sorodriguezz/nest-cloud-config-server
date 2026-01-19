import { Logger } from "@nestjs/common";

export interface LoggerLike {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  verbose: (...args: any[]) => void;
}

export const createLogger = (
  context: string,
  enabled: boolean = true
): LoggerLike => {
  if (enabled) {
    return new Logger(context);
  }

  return new NoopLogger();
};

class NoopLogger implements LoggerLike {
  log() {}
  error() {}
  warn() {}
  debug() {}
  verbose() {}
}
