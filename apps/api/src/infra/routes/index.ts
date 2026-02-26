import { Router } from 'express';
import healthRouter from './health';
import inventoryRouter from './inventory';

const router = Router();
router.use(healthRouter);
router.use(inventoryRouter);

export default router;
