import type { Request } from "express";

type LogLevel = "debug" | "info" | "warn" | "error";

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "\"<unserializable>\"";
  }
}

function nowIso() {
  return new Date().toISOString();
}

function log(level: LogLevel, data: Record<string, unknown>, message: string) {

  const payload = {
    ts: nowIso(),
    level,
    msg: message,
    ...data,
  };

  console[level === "debug" ? "log" : level](safeJson(payload));
}

export const logger = {
  debug: (data: Record<string, unknown>, message: string) => log("debug", data, message),
  info: (data: Record<string, unknown>, message: string) => log("info", data, message),
  warn: (data: Record<string, unknown>, message: string) => log("warn", data, message),
  error: (data: Record<string, unknown>, message: string) => log("error", data, message),
};

export function getCorrelationId(req: Request): string | undefined {
  return (req as any).correlationId as string | undefined;
}

export function baseReqLog(req: Request) {
  return {
    correlationId: getCorrelationId(req),
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
  };
}