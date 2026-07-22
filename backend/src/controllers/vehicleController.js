const prisma = require('../config/db');

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity, imageUrl, description } = req.body;

    if (
      !make || !model || !category || price === undefined ||
      make.trim() === '' || model.trim() === '' || category.trim() === ''
    ) {
      return res.status(400).json({ error: 'Make, model, category, and price are required and cannot be empty' });
    }

    const qty = quantity !== undefined ? parseInt(quantity) : 0;
    const prc = parseFloat(price);

    // Guard against NaN or negative values
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }
    if (isNaN(prc) || prc <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number greater than 0' });
    }

    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Image URL must be a valid HTTP/HTTPS link or a Base64 data URL' });
    }

    // Create a new vehicle entry in MongoDB
    const newVehicle = await prisma.vehicle.create({
      data: {
        make: make.trim(),
        model: model.trim(),
        category: category.trim(),
        price: prc,
        quantity: qty,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        description: description ? description.trim() : null
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
    const { make, model, category, price, quantity, imageUrl, description } = req.body;

    // Check if ID is a valid MongoDB ObjectId length
    if (!id || id.length !== 24) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const data = {};
    if (make !== undefined) {
      if (make.trim() === '') return res.status(400).json({ error: 'Make cannot be empty' });
      data.make = make.trim();
    }
    if (model !== undefined) {
      if (model.trim() === '') return res.status(400).json({ error: 'Model cannot be empty' });
      data.model = model.trim();
    }
    if (category !== undefined) {
      if (category.trim() === '') return res.status(400).json({ error: 'Category cannot be empty' });
      data.category = category.trim();
    }
    if (imageUrl !== undefined) {
      if (imageUrl !== null && imageUrl.trim() !== '') {
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:image/')) {
          return res.status(400).json({ error: 'Image URL must be a valid HTTP/HTTPS link or a Base64 data URL' });
        }
      }
      data.imageUrl = imageUrl ? imageUrl.trim() : null;
    }
    if (description !== undefined) {
      data.description = description ? description.trim() : null;
    }

    if (price !== undefined) {
      const prc = parseFloat(price);
      if (isNaN(prc) || prc <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number greater than 0' });
      }
      data.price = prc;
    }

    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
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
