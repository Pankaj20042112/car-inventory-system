import prisma from '../config/db';
import { Role } from '@car-dealership/shared';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: { name: string; email: string; passwordHash: string; role?: Role }) {
    return prisma.user.create({ data });
  }
}
