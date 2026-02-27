import { Router } from "express";
import { healthRouter } from "./health";

import { authRouter } from "../../routes/auth.routes";
import { inventoryRouter } from '../../routes/inventory.routes';

export function buildApiRouter() {
  const router = Router();

  // Public endpoints
  router.use(healthRouter());

 // protected by auth endpoints
  router.use("/auth", authRouter());
  router.use("/inventory", inventoryRouter());

  return router;
}