import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export function auth() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return next(
        new AppError({
          status: 401,
          title: "Unauthorized",
          detail: "Missing Bearer token.",
          type: "urn:telecom:error:auth",
        })
      );
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as any;
      (req as any).user = { id: payload.sub, roleIds: payload.roleIds || [] };
      next();
    } catch {
      return next(
        new AppError({
          status: 401,
          title: "Unauthorized",
          detail: "Invalid token.",
          type: "urn:telecom:error:auth",
        })
      );
    }
  };
}