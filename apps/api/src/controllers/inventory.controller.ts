import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InventoryService } from '../services/inventory.service';
import { PurchaseSchema } from '@car-dealership/shared';
import prisma from '../config/db';

export class InventoryController {
  static async purchase(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = PurchaseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      }

      const { purchase, vehicle } = await InventoryService.purchaseVehicle(
        req.user.id,
        req.params.id,
        parsed.data.quantity
      );

      return res.status(200).json({ success: true, data: { purchase, vehicle } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async restock(req: AuthRequest, res: Response) {
    try {
      const quantity = parseInt(req.body.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity provided' });
      }

      const vehicle = await InventoryService.restockVehicle(req.params.id, quantity);
      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async dashboard(req: AuthRequest, res: Response) {
    try {
      const stats = await InventoryService.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async myPurchases(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const purchases = await InventoryService.getUserPurchases(req.user.id);
      return res.status(200).json({ success: true, data: purchases });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async allPurchases(req: AuthRequest, res: Response) {
    try {
      const purchases = await InventoryService.getAllPurchases();
      return res.status(200).json({ success: true, data: purchases });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async checkout(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { vehicleIds } = req.body;
      if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Vehicle IDs are required' });
      }

      const counts: { [id: string]: number } = {};
      for (const id of vehicleIds) {
        counts[id] = (counts[id] || 0) + 1;
      }

      const purchases: any[] = [];
      const result = await prisma.$transaction(async (tx: any) => {
        for (const [vehicleId, quantity] of Object.entries(counts)) {
          const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
          if (!vehicle) {
            throw new Error(`Vehicle ${vehicleId} not found`);
          }
          if (vehicle.quantity < quantity) {
            throw new Error(`Insufficient stock for ${vehicle.make} ${vehicle.model}`);
          }

          let unitPrice = vehicle.price;
          if (vehicle.category && vehicle.category.toLowerCase() === 'sedan') {
            unitPrice = vehicle.price * 0.9;
          }
          const totalPrice = unitPrice * quantity;

          await tx.vehicle.update({
            where: { id: vehicleId },
            data: { quantity: { decrement: quantity } }
          });

          const purchase = await tx.purchase.create({
            data: {
              userId: req.user!.id,
              vehicleId,
              quantity,
              totalPrice
            }
          });
          purchases.push(purchase);
        }
        return purchases;
      });

      return res.status(200).json({ success: true, data: { purchases: result } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
