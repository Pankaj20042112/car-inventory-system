const Vehicle = require('../models/Vehicle');

exports.purchaseVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }

    vehicle.quantity -= 1;
    await vehicle.save();

    return res.status(200).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.restockVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || parseInt(quantity) <= 0) {
      return res.status(400).json({ error: 'Restock quantity must be a positive integer' });
    }

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicle.quantity += parseInt(quantity);
    await vehicle.save();

    return res.status(200).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
