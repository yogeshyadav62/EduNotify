import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edunotifysecretkey123';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    // If no header, allow unauthenticated through but without req.user populated
    // Controllers can handle optional security or return error
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token format is invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};

// Middleware to restrict access to Admins only
export const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  });
};
