import prisma from '../config/db';
import { VehicleRepository } from '../repositories/vehicle.repository';

export class InventoryService {
  static async purchaseVehicle(userId: string, vehicleId: string, quantity: number) {
    return prisma.$transaction(async (tx: any) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      if (vehicle.quantity < quantity) {
        throw new Error('Vehicle is out of stock or has insufficient quantity');
      }

      // 10% Sedan category discount
      let unitPrice = vehicle.price;
      if (vehicle.category && vehicle.category.toLowerCase() === 'sedan') {
        unitPrice = vehicle.price * 0.9;
      }
      const totalPrice = unitPrice * quantity;

      const updated = await tx.vehicle.update({
        where: { id: vehicleId },
        data: { quantity: { decrement: quantity } }
      });

      const purchase = await tx.purchase.create({
        data: {
          userId,
          vehicleId,
          quantity,
          totalPrice
        }
      });

      return { purchase, vehicle: updated };
    });
  }

  static async restockVehicle(vehicleId: string, quantity: number) {
    const vehicle = await VehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return VehicleRepository.update(vehicleId, {
      quantity: vehicle.quantity + quantity
    });
  }

  static async getDashboardStats() {
    const vehicles = await prisma.vehicle.findMany();
    const purchases = await prisma.purchase.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalModels = vehicles.length;
    const totalStock = vehicles.reduce((acc: number, v: any) => acc + v.quantity, 0);
    const outOfStock = vehicles.filter((v: any) => v.quantity <= 0).length;
    const lowStock = vehicles.filter((v: any) => v.quantity > 0 && v.quantity <= 2).length;
    const totalValue = vehicles.reduce((acc: number, v: any) => acc + v.price * v.quantity, 0);

    return {
      totalModels,
      totalStock,
      outOfStock,
      lowStock,
      totalValue,
      recentPurchases: purchases.slice(0, 10)
    };
  }

  static async getUserPurchases(userId: string) {
    return prisma.purchase.findMany({
      where: { userId },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAllPurchases() {
    return prisma.purchase.findMany({
      include: { user: true, vehicle: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
