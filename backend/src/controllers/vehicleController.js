const prisma = require('../config/db');

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined) {
      return res.status(400).json({ error: 'make, model, category, and price are required' });
    }

    const qty = quantity !== undefined ? parseInt(quantity) : 0;
    const prc = parseFloat(price);

    // Check if vehicle with same make, model, and category (case-insensitive) already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        category: { equals: category, mode: 'insensitive' }
      }
    });

    if (existingVehicle) {
      // Update quantity and price of the existing vehicle
      const updated = await prisma.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          quantity: existingVehicle.quantity + qty,
          price: prc
        }
      });
      return res.status(200).json(updated);
    }

    // Otherwise, create a new vehicle entry
    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        category,
        price: prc,
        quantity: qty
      }
    });

    return res.status(201).json(newVehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.searchVehicles = async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const where = {};

    if (make) {
      where.make = { contains: make, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const vehicles = await prisma.vehicle.findMany({ where });
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity } = req.body;

    // Check if ID is a valid MongoDB ObjectId length
    if (!id || id.length !== 24) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const data = {};
    if (make !== undefined) data.make = make;
    if (model !== undefined) data.model = model;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = parseFloat(price);
    if (quantity !== undefined) data.quantity = parseInt(quantity);

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicle.delete({ where: { id } });

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
