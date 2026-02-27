import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

const HEADER_NAME = "x-correlation-id";

export function correlationId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.header(HEADER_NAME);
    const id = (incoming && incoming.trim().length > 0) ? incoming.trim() : `c_${randomUUID()}`;

    // Attach to req for logs
    (req as any).correlationId = id;

    // Echo back in response
    res.setHeader(HEADER_NAME, id);

    next();
  };
}