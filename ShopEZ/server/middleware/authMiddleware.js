import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  if (!token) { res.status(401); return next(new Error('Authentication token missing')); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) { res.status(401); return next(new Error('User is inactive or unavailable')); }
    next();
  } catch (_error) { res.status(401); next(new Error('Invalid or expired token')); }
};
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) { res.status(403); return next(new Error('You are not authorized to access this resource')); }
  next();
};
