/**
 * Authentication Middleware 
 *
 * This middleware function is used to authenticate users
 */


const jwt = require('jsonwebtoken');

// 
const authenticateJWT = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Extract the token after "Bearer "
    const token = authHeader.split(' ')[1];

    // Verify the token using the same secret used to sign the JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If token is not valid or expired, respond with 403 Forbidden
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
      }
      
      // If token is valid, attach decoded user to request object
      req.user = decoded;
      
      // Proceed to the next middleware function or the route handler
      next();
    });
  } else {
    // If no token is provided, respond with 401 Unauthorized
    res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
};

// A new middleware function to check for the user's role
const authorizeRole = (roles) => (req, res, next) => {
    authenticateJWT(req, res, () => {
      if (roles.includes(req.user.role)) {
        next(); // The user has one of the required roles, proceed to the next middleware
      } else {
        res.status(403).json({ message: 'Forbidden - You do not have permission to perform this action' });
      }
    });
  };
  
  module.exports = { authenticateJWT, authorizeRole };
