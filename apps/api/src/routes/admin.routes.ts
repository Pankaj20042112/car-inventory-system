import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@car-dealership/shared';

const router = Router();

router.get('/dashboard', authenticate as any, authorize(Role.ADMIN) as any, InventoryController.dashboard as any);
router.get('/purchases', authenticate as any, authorize(Role.ADMIN) as any, InventoryController.allPurchases as any);
router.get('/purchases/my', authenticate as any, InventoryController.myPurchases as any);

export default router;
