import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check for JWT Bearer Token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, image: true, whatsapp: true }
      });

      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  // 2. Check for Passport Session
  if (req.isAuthenticated && req.isAuthenticated()) {
    // req.user is already populated by Passport
    return next();
  }

  res.status(401).json({ error: 'Not authorized, no token or session' });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user?.role} is not authorized to access this route` 
      });
    }
    next();
  };
};
