const prisma = require('../config/db');

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity, imageUrl } = req.body;

    if (!make || !model || !category || price === undefined) {
      return res.status(400).json({ error: 'make, model, category, and price are required' });
    }

    const qty = quantity !== undefined ? parseInt(quantity) : 0;
    const prc = parseFloat(price);

    // Guard against NaN or negative values
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }
    if (isNaN(prc) || prc < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }

    // Create a new vehicle entry in MongoDB
    const newVehicle = await prisma.vehicle.create({
      data: {
        make: make.trim(),
        model: model.trim(),
        category: category.trim(),
        price: prc,
        quantity: qty,
        imageUrl: imageUrl ? imageUrl.trim() : null
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

    let vehicles = await prisma.vehicle.findMany();

    // Perform case-insensitive matching in memory
    if (make) {
      const searchMake = make.toLowerCase();
      vehicles = vehicles.filter((v) => v.make.toLowerCase().includes(searchMake));
    }
    if (model) {
      const searchModel = model.toLowerCase();
      vehicles = vehicles.filter((v) => v.model.toLowerCase().includes(searchModel));
    }
    if (category) {
      const searchCategory = category.toLowerCase();
      vehicles = vehicles.filter((v) => v.category.toLowerCase().includes(searchCategory));
    }

    if (minPrice !== undefined && minPrice !== '') {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        vehicles = vehicles.filter((v) => v.price >= minVal);
      }
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        vehicles = vehicles.filter((v) => v.price <= maxVal);
      }
    }

    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity, imageUrl } = req.body;

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
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    if (price !== undefined) {
      const prc = parseFloat(price);
      if (isNaN(prc) || prc < 0) {
        return res.status(400).json({ error: 'price must be a non-negative number' });
      }
      data.price = prc;
    }

    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ error: 'quantity must be a non-negative integer' });
      }
      data.quantity = qty;
    }

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
