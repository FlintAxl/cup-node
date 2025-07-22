const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated
// This will check for a valid JWT token in the Authorization header
// If the token is valid, it will decode it and attach user info to req.user
exports.isAuthenticatedUser = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Login first to access this resource' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };  // 👈 store role too
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has the required role
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role: ${req.user.role} is not allowed to access this resource` });
    }
    next();
  };
};
