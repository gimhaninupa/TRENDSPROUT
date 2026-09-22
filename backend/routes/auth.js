import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide username, email and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ status: 'fail', message: 'User already exists with this email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone: phone || '',
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400).json({ status: 'fail', message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email/username and password' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        status: 'success',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401).json({ status: 'fail', message: 'Invalid email/username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
