import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InventoryService } from '../services/inventory.service';
import { PurchaseSchema } from '@car-dealership/shared';

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
}
