import { z } from 'zod';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  category: z.string().optional(),
  role: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required')
});

export const VehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  year: z.number().int().min(1886).max(new Date().getFullYear() + 2),
  price: z.number().positive('Price must be greater than zero'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  imageUrl: z.string().url().optional().or(z.string().length(0)),
  description: z.string().optional()
});

export const PurchaseSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VehicleInput = z.infer<typeof VehicleSchema>;
export type PurchaseInput = z.infer<typeof PurchaseSchema>;
