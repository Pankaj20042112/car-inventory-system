const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/:id/purchase', authenticateToken, inventoryController.purchaseVehicle);
router.post('/:id/restock', authenticateToken, requireAdmin, inventoryController.restockVehicle);

module.exports = router;
