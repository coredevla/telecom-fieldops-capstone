import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermissions } from '../middleware/rbac';
import { kpiService } from '../domain/services/kpi.service';

export function kpiRouter() {
  const router = Router();

  router.use(authenticate);
  router.use(requirePermissions(['kpis:read']));

  router.get('/dashboard/kpis', (_req, res) => {
    res.status(200).json(kpiService.getDashboardKpis());
  });

  router.get('/kpis/summary', (_req, res) => {
    res.status(200).json(kpiService.getDashboardKpis());
  });

  return router;
}

const router = kpiRouter();

export default router;
