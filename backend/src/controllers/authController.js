const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { username, password, role, name, email, category } = req.body;

    if (
      !username || !password || !name || !email || !category ||
      username.trim() === '' || password.trim() === '' || name.trim() === '' || email.trim() === '' || category.trim() === ''
    ) {
      return res.status(400).json({ error: 'Username, password, name, email, and category are required' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: username.trim(),
              mode: 'insensitive'
            }
          },
          {
            email: {
              equals: email.trim(),
              mode: 'insensitive'
            }
          }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.trim().toLowerCase()) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        role: role || 'user',
        name: name.trim(),
        email: email.trim(),
        category: category.trim()
      }
    });

    const userJson = { ...newUser };
    delete userJson.password;

    return res.status(201).json({
      message: 'User registered successfully',
      user: userJson
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the user case-insensitively and trimmed
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userJson = { ...user };
    delete userJson.password;

    return res.status(200).json({
      token,
      user: userJson
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ error: 'User does not exist in the database' });
    }

    const userJson = { ...user };
    delete userJson.password;

    return res.status(200).json(userJson);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, category } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const data = {};
    if (name !== undefined) {
      if (name.trim() === '') return res.status(400).json({ error: 'Name cannot be empty' });
      data.name = name.trim();
    }
    if (email !== undefined) {
      if (email.trim() === '') return res.status(400).json({ error: 'Email cannot be empty' });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const otherUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (otherUser) {
        return res.status(400).json({ error: 'Email is already registered by another account' });
      }
      data.email = email.trim();
    }
    if (category !== undefined) {
      if (category.trim() === '') return res.status(400).json({ error: 'Category cannot be empty' });
      data.category = category.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    });

    const userJson = { ...updatedUser };
    delete userJson.password;

    return res.status(200).json(userJson);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
