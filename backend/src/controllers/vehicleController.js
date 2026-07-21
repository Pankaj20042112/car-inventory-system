const Vehicle = require('../models/Vehicle');

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined) {
      return res.status(400).json({ error: 'make, model, category, and price are required' });
    }

    const newVehicle = await Vehicle.create({
      make,
      model,
      category,
      price: parseFloat(price),
      quantity: quantity !== undefined ? parseInt(quantity) : 0
    });

    return res.status(201).json(newVehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.searchVehicles = async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (make) {
      query.make = { $regex: make, $options: 'i' };
    }
    if (model) {
      query.model = { $regex: model, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    const vehicles = await Vehicle.find(query);
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity } = req.body;

    // Check if ID is a valid MongoDB ObjectId (avoids casting errors)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (make !== undefined) vehicle.make = make;
    if (model !== undefined) vehicle.model = model;
    if (category !== undefined) vehicle.category = category;
    if (price !== undefined) vehicle.price = parseFloat(price);
    if (quantity !== undefined) vehicle.quantity = parseInt(quantity);

    await vehicle.save();

    return res.status(200).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.deleteOne();

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
