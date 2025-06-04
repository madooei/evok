import {
  LogManagerImpl,
  type Logger,
  type LogLevel,
} from "@coursebook/simple-logger";

const logManager = LogManagerImpl.getInstance();
function setLogLevel(level: LogLevel) {
  logManager.setLogLevel("Evok:*", level);
}

export { logManager, type Logger, setLogLevel };
