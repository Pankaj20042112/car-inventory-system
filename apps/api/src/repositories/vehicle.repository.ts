import prisma from '../config/db';
import { VehicleInput } from '@car-dealership/shared';

export class VehicleRepository {
  static async findById(id: string) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  static async findAll(filters: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { skip, take, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    return prisma.vehicle.findMany({
      skip,
      take,
      orderBy: { [sortBy]: sortOrder }
    });
  }

  static async countAll() {
    return prisma.vehicle.count();
  }

  static async search(filters: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    inStock?: boolean;
  }) {
    const whereClause: any = {};

    if (filters.make) whereClause.make = { contains: filters.make, mode: 'insensitive' };
    if (filters.model) whereClause.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.category) whereClause.category = { contains: filters.category, mode: 'insensitive' };

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.price = {};
      if (filters.minPrice !== undefined) whereClause.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) whereClause.price.lte = filters.maxPrice;
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      whereClause.year = {};
      if (filters.minYear !== undefined) whereClause.year.gte = filters.minYear;
      if (filters.maxYear !== undefined) whereClause.year.lte = filters.maxYear;
    }

    if (filters.inStock) {
      whereClause.quantity = { gt: 0 };
    }

    return prisma.vehicle.findMany({ where: whereClause });
  }

  static async create(data: VehicleInput) {
    return prisma.vehicle.create({ data });
  }

  static async update(id: string, data: Partial<VehicleInput>) {
    return prisma.vehicle.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.vehicle.delete({ where: { id } });
  }
}
