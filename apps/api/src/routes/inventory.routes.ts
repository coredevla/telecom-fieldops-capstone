import { Router, Request, Response } from 'express';
import { inventoryService } from '../domain/services/invetory.service';


export function inventoryRouter() {

const router = Router();

router.get('/inventory/branches', (_req: Request, res: Response) => {
  res.status(200).json(inventoryService.listBranches());
});

router.get('/inventory/products', (_req: Request, res: Response) => {
  res.status(200).json(inventoryService.listProducts());
});

router.get('/inventory', (req: Request, res: Response) => {
  const branchId = String(req.query.branchId ?? '').trim();
  if (!branchId) {
    res.status(400).json({ message: 'branchId is required' });
    return;
  }

  res.status(200).json(inventoryService.listInventory(branchId));
});

router.post('/inventory/reservations', (req: Request, res: Response) => {
  try {
    const result = inventoryService.reserveForRequest({
      workOrderId: String(req.body?.workOrderId ?? ''),
      branchId: String(req.body?.branchId ?? ''),
      items: Array.isArray(req.body?.items) ? req.body.items : []
    });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message.includes('Insufficient stock') ? 409 : 400;
    res.status(status).json({ message });
  }
});

router.delete('/inventory/reservations/:workOrderId', (req: Request, res: Response) => {
  try {
    const result = inventoryService.releaseForRequest(req.params.workOrderId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ message });
  }
});

return router;

}