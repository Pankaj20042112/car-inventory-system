import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { RegisterSchema, LoginSchema } from '@car-dealership/shared';

export class AuthController {
  static async register(req: AuthRequest, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      }

      const result = await AuthService.register(parsed.data);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: AuthRequest, res: Response) {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      }

      const result = await AuthService.login(parsed.data);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      return res.status(200).json({ success: true, data: { user } });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}
