import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { validate } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";
import { writeAudit } from "../middleware/audit";
import { baseReqLog, logger } from "../infra/logger/logger";

// Demo users (in-memory)
const USERS = [
  { id: "usr_admin_01", username: "admin", password: "admin123", roleIds: ["role_admin"], isActive: true },
  { id: "usr_sales_01", username: "sales1", password: "sales123", roleIds: ["role_sales"], isActive: true },
];

const LoginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(3),
});

export function authRouter() {
  const router = Router();

  // POST /api/v1/auth/login
  router.post(
    "/login",
    validate(LoginSchema),
    async (req, res) => {
      const { username, password } = req.body;

      const user = USERS.find((u) => u.username === username);
      if (!user || user.password !== password) {
        throw new AppError({
          status: 401,
          title: "Unauthorized",
          detail: "Invalid credentials.",
          type: "urn:telecom:error:auth",
        });
      }
      if (!user.isActive) {
        throw new AppError({
          status: 403,
          title: "Forbidden",
          detail: "User is blocked.",
          type: "urn:telecom:error:user_blocked",
        });
      }

      const accessToken = jwt.sign(
        { sub: user.id, roleIds: user.roleIds },
        env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      // Audit
      await writeAudit(req, {
        action: "USER_LOGIN",
        entityType: "user",
        entityId: user.id,
        before: null,
        after: { username: user.username },
      });

      logger.info({ ...baseReqLog(req), userId: user.id }, "Login success");

      res.status(200).json({
        accessToken,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
    }
  );

  // POST /api/v1/auth/logout 
  router.post("/logout", async (req, res) => {
   
    res.status(200).json({ status: "ok" });
  });

  return router;
}