const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Note: /search MUST be registered before /:id to prevent route matching collisions
router.get('/search', authenticateToken, vehicleController.searchVehicles);
router.get('/', authenticateToken, vehicleController.getVehicles);
router.post('/', authenticateToken, vehicleController.createVehicle);
router.put('/:id', authenticateToken, requireAdmin, vehicleController.updateVehicle);
router.delete('/:id', authenticateToken, requireAdmin, vehicleController.deleteVehicle);

// Inventory control routes
router.post('/:id/purchase', authenticateToken, inventoryController.purchaseVehicle);
router.post('/:id/restock', authenticateToken, requireAdmin, inventoryController.restockVehicle);

module.exports = router;
