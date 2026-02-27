import { Router } from 'express';
import { userService } from '../domain/services/user.service';
import { authenticate } from '../middleware/auth';
import { needs } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', needs(['roles:read']), (_req, res) => {
  const roles = userService.listRoles();
  res.status(200).json(roles);
});

export default router;
