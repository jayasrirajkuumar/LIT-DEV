import config from "../config/env.js";

const levels = ["debug", "info", "warn", "error"];

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

function log(level, message, meta) {
  if (config.isProduction && level === "debug") {
    return;
  }

  const output = formatMessage(level, message, meta);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export const logger = {
  debug: (message, meta) => log("debug", message, meta),
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};
