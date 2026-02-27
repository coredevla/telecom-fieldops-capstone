import type { NextFunction, Request, Response } from "express";
import { logger, baseReqLog } from "../infra/logger/logger";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  correlationId: string;
  errors?: Record<string, string[]>;
};

function getCorrelationId(req: Request): string {
  return ((req as any).correlationId as string) || "c_unknown";
}

function sendProblem(res: Response, problem: ProblemDetails) {
  res.status(problem.status).json(problem);
}

// Custom application error class for known error scenarios
export class AppError extends Error {
  status: number;
  type: string;
  errors?: Record<string, string[]>;
  constructor(params: { status: number; title: string; detail: string; type?: string; errors?: Record<string, string[]> }) {
    super(params.detail);
    this.name = "AppError";
    this.status = params.status;
    this.type = params.type ?? "urn:telecom:error:app";
    this.errors = params.errors;
  }
}

export function errorHandler() {
  return (err: any, req: Request, res: Response, _next: NextFunction) => {
    const correlationId = getCorrelationId(req);

    // If headers already sent, delegate to default express handler
    if (res.headersSent) return;

    // Known business/app errors
    if (err instanceof AppError) {
      logger.warn(
        { ...baseReqLog(req), status: err.status, type: err.type, errors: err.errors },
        "Handled AppError"
      );

      return sendProblem(res, {
        type: err.type,
        title: "Request failed",
        status: err.status,
        detail: err.message,
        instance: req.originalUrl || req.url,
        correlationId,
        errors: err.errors,
      });
    }

    // Zod validation error support (if you use zod)
    if (err?.name === "ZodError") {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues ?? []) {
        const key = (issue.path ?? []).join(".") || "body";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }

      logger.warn({ ...baseReqLog(req), status: 400, errors: fieldErrors }, "Validation error (Zod)");

      return sendProblem(res, {
        type: "urn:telecom:error:validation",
        title: "Validation error",
        status: 400,
        detail: "Invalid request payload.",
        instance: req.originalUrl || req.url,
        correlationId,
        errors: fieldErrors,
      });
    }


    logger.error(
      { ...baseReqLog(req), errName: err?.name, errMessage: err?.message, stack: err?.stack },
      "Unhandled error"
    );

    return sendProblem(res, {
      type: "urn:telecom:error:internal",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred.",
      instance: req.originalUrl || req.url,
      correlationId,
    });
  };
}