import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { RegisterSchema, LoginSchema } from '@car-dealership/shared';
import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';

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

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { name, email, category } = req.body;
      const userId = req.user.id;

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email;
      if (category !== undefined) data.category = category;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data
      });

      const userJson = { ...updatedUser } as any;
      delete userJson.passwordHash;

      return res.status(200).json({ success: true, data: userJson });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updatePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
      });

      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
