const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
}

function requireSeller(req, res, next) {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireSeller,
};
