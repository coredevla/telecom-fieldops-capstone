import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validate(schema: ZodSchema, target: "body" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(target === "body" ? req.body : req.query);
      if (target === "body") req.body = parsed;
      else (req.query as any) = parsed;
      next();
    } catch (err) {
      next(err); // errorHandler already handles ZodError
    }
  };
}