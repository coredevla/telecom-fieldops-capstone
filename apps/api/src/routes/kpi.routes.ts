import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermissions } from '../middleware/rbac';
import { kpiService } from '../domain/services/kpi.service';

export function kpiRouter() {
  const router = Router();

  router.use(authenticate);
  router.use(requirePermissions(['kpis:read']));

  router.get('/dashboard/kpis', async (_req, res) => {
    const data = await kpiService.getDashboardKpis();
    res.status(200).json(data);
  });

  router.get('/kpis/summary', async (_req, res) => {
    const data = await kpiService.getDashboardKpis();
    res.status(200).json(data);
  });

  return router;
}

const router = kpiRouter();

export default router;
