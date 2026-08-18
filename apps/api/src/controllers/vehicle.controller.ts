import { Request, Response } from 'express';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { VehicleSchema } from '@car-dealership/shared';

export class VehicleController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = VehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      }

      const vehicle = await VehicleRepository.create(parsed.data);
      return res.status(201).json({ success: true, data: vehicle });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const skip = (page - 1) * limit;
      const [vehicles, total] = await Promise.all([
        VehicleRepository.findAll({ skip, take: limit, sortBy, sortOrder }),
        VehicleRepository.countAll()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          vehicles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const vehicle = await VehicleRepository.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const make = req.query.make as string;
      const model = req.query.model as string;
      const category = req.query.category as string;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const minYear = req.query.minYear ? parseInt(req.query.minYear as string) : undefined;
      const maxYear = req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined;
      const inStock = req.query.inStock === 'true';

      const vehicles = await VehicleRepository.search({
        make, model, category, minPrice, maxPrice, minYear, maxYear, inStock
      });

      return res.status(200).json({ success: true, data: { vehicles } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const parsed = VehicleSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      }

      const vehicle = await VehicleRepository.update(req.params.id, parsed.data);
      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await VehicleRepository.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
  }
}
