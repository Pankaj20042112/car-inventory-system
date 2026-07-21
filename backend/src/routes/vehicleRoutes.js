const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Note: /search MUST be registered before /:id to prevent route matching collisions
router.get('/search', authenticateToken, vehicleController.searchVehicles);
router.get('/', authenticateToken, vehicleController.getVehicles);
router.post('/', authenticateToken, requireAdmin, vehicleController.createVehicle);
router.put('/:id', authenticateToken, requireAdmin, vehicleController.updateVehicle);
router.delete('/:id', authenticateToken, requireAdmin, vehicleController.deleteVehicle);

module.exports = router;
