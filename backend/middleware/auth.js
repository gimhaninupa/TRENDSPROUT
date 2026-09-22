import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'User not found' });
      }

      next();
      return;
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ status: 'fail', message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access based on roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
