import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workOrderService } from '../domain/services/workorder.service';
import { authenticate } from '../middleware/auth';
import { requirePermissions } from '../middleware/rbac';
import { validateBody, validateParams } from '../middleware/validate';

const router = Router();

const workOrderIdParams = z.object({ id: z.string().min(1) });

const createSchema = z.object({
  type: z.string().min(1),
  customerId: z.string().min(1),
  branchId: z.string().min(1).optional(),
  planId: z.string().min(1).optional(),
  items: z.array(
    z.object({ productId: z.string().min(1), qty: z.number().int().positive() }),
  ).optional(),
});

const updateStatusSchema = z.object({
  newStatus: z.string().min(1),
  baseVersion: z.number().int().nonnegative(),
});

router.use(authenticate);

router.get(
  '/work-orders',
  requirePermissions(['workorders:read']),
  (_req: Request, res: Response) => {
    const list = workOrderService.listWorkOrders();
    res.status(200).json(list);
  },
);

router.get(
  '/work-orders/:id',
  requirePermissions(['workorders:read']),
  validateParams(workOrderIdParams),
  (req: Request, res: Response) => {
    const wo = workOrderService.getWorkOrder(req.params.id);
    if (!wo) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }
    res.status(200).json(wo);
  },
);

router.post(
  '/work-orders',
  requirePermissions(['workorders:create']),
  validateBody(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await workOrderService.createWorkOrder(
        req.body,
        req.user?.id ?? null,
        req.correlationId,
      );
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/work-orders/:id/status',
  requirePermissions(['workorders:update-state']),
  validateParams(workOrderIdParams),
  validateBody(updateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await workOrderService.updateStatus(
        req.params.id,
        req.body,
        req.user?.id ?? null,
        req.correlationId,
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
