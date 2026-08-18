import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '@car-dealership/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export class AuthService {
  static async register(input: RegisterInput) {
    const existingEmail = await UserRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const existingUsername = await UserRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email,
      username: input.username,
      passwordHash,
      category: input.category || 'Customer',
      role: input.role ? input.role.toUpperCase() : 'USER'
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, category: user.category }, token };
  }

  static async login(input: LoginInput) {
    const identifier = input.email || input.username;
    if (!identifier) {
      throw new Error('Email or username is required');
    }

    let user = await UserRepository.findByEmail(identifier);
    if (!user) {
      user = await UserRepository.findByUsername(identifier);
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, category: user.category }, token };
  }

  static async getCurrentUser(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, category: user.category };
  }
}
