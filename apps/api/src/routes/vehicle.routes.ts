import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@car-dealership/shared';

const router = Router();

// Public routes for exploration
router.get('/', VehicleController.getAll);
router.get('/search', VehicleController.search);

// Protected transaction list routes
router.get('/my-purchases', authenticate as any, InventoryController.myPurchases as any);
router.get('/all-purchases', authenticate as any, authorize(Role.ADMIN) as any, InventoryController.allPurchases as any);
router.post('/checkout', authenticate as any, InventoryController.checkout as any);

router.get('/:id', VehicleController.getById);

// Protected routes (Admin operations)
router.post('/', authenticate as any, authorize(Role.ADMIN) as any, VehicleController.create);
router.put('/:id', authenticate as any, authorize(Role.ADMIN) as any, VehicleController.update);
router.delete('/:id', authenticate as any, authorize(Role.ADMIN) as any, VehicleController.delete);

// Inventory transactions
router.post('/:id/purchase', authenticate as any, InventoryController.purchase as any);
router.post('/:id/restock', authenticate as any, authorize(Role.ADMIN) as any, InventoryController.restock as any);

export default router;
