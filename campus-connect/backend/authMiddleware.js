/**
 * Authentication Middleware for Express.js
 *
 * Purpose:
 * This middleware function is designed to secure routes in an Express.js
 * (Express.js is one framework of Node.js) application
 * by verifying JSON Web Tokens (JWT) sent in the Authorization header of HTTP requests.
 * It ensures that only requests with a valid JWT, which signifies authenticated users,
 * can access protected routes and resources.
 *
 * Usage:
 * To use this middleware, import it into your route module file and apply it to routes
 * that require user authentication. When a request is made to a protected route, this
 * middleware will extract the JWT from the Authorization header, verify its validity, and
 * if valid, allow the request to proceed. If the token is missing, expired, or invalid,
 * the middleware will respond with the appropriate HTTP status code indicating an unauthorized
 * request, thus preventing access to the route's handler.
 *
 * Example:
 * const authenticateJWT = require('./authMiddleware');
 * app.post("/protected-route", authenticateJWT, (req, res) => {
 *   // Handle request - only authenticated users can access this
 * });
 *
 * Note:
 * This middleware requires the `jsonwebtoken` package to verify the JWT against
 * the secret key used to sign the token. Ensure the JWT_SECRET environment variable
 * is set with the secret key.
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
