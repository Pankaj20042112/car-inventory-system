const prisma = require('../config/db');

exports.purchaseVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }

    const buyer = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const receiptNo = 'REC-' + Math.floor(100000 + Math.random() * 900000);

    const purchase = await prisma.purchase.create({
      data: {
        receiptNo,
        buyerId: buyer.id,
        buyerName: buyer.name || buyer.username,
        buyerEmail: buyer.email || 'N/A',
        buyerCategory: buyer.category || 'Customer',
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        price: vehicle.price
      }
    });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: {
          decrement: 1
        }
      }
    });

    return res.status(200).json({
      vehicle: updated,
      purchase
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.restockVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (quantity === undefined || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Restock quantity must be a positive integer' });
    }

    if (!id || id.length !== 24) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: {
          increment: qty
        }
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(purchases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(purchases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
