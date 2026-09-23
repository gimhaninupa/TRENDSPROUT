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
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (userExists) {
      return res.status(400).json({ status: 'fail', message: 'User already exists with this email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'customer',
      phone: phone || '',
      isVerified: true,
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
          profileImage: user.profileImage,
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
          profileImage: user.profileImage,
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

// @desc    Authenticate with Google OAuth ID Token
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'customer' } = req.body;

    if (!credential) {
      return res.status(400).json({ status: 'fail', message: 'Google credential token is required' });
    }

    // Decode Google ID Token payload
    let payload = null;
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString('latin1')
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      payload = JSON.parse(jsonPayload);
    } catch {
      return res.status(400).json({ status: 'fail', message: 'Invalid Google credential token' });
    }

    const { email, name, picture, sub } = payload;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Email not provided by Google' });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const generatedUsername = name.replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(1000 + Math.random() * 9000);
      const randomPassword = await bcrypt.hash(sub + (process.env.JWT_SECRET || 'trendsprout'), 10);

      user = await User.create({
        username: generatedUsername,
        email: email.toLowerCase(),
        password: randomPassword,
        role,
        profileImage: picture || '',
        isVerified: true,
      });
    }

    res.json({
      status: 'success',
      message: 'Google login successful',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
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
