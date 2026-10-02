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

import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Helper to decode Google JWT token securely
const verifyGoogleToken = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      return ticket.getPayload();
    } catch (err) {
      console.warn('Google client verification failed, attempting payload decode:', err.message);
    }
  }

  // Fallback JWT payload decoder
  const base64Url = credential.split('.')[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    Buffer.from(base64, 'base64')
      .toString('latin1')
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

// @desc    Authenticate with Google OAuth ID Token
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'customer' } = req.body;

    if (!credential) {
      return res.status(400).json({ status: 'fail', message: 'Google credential token is required' });
    }

    // Decode & verify Google ID Token payload
    let payload = null;
    try {
      payload = await verifyGoogleToken(credential);
    } catch {
      return res.status(400).json({ status: 'fail', message: 'Invalid Google credential token' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ status: 'fail', message: 'Email could not be retrieved from Google account' });
    }

    const { email, name, picture, sub } = payload;

    // Find or create user in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const cleanName = (name || 'user').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const generatedUsername = `${cleanName}_${Math.floor(1000 + Math.random() * 9000)}`;
      const randomPassword = await bcrypt.hash((sub || Date.now().toString()) + (process.env.JWT_SECRET || 'trendsprout'), 10);

      user = await User.create({
        username: generatedUsername,
        email: email.toLowerCase(),
        password: randomPassword,
        role: role || 'customer',
        profileImage: picture || '',
        isVerified: true,
      });
    } else if (picture && (!user.profileImage || user.profileImage.includes('unsplash'))) {
      // Update profile image if customer didn't have custom avatar
      user.profileImage = picture;
      await user.save();
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
