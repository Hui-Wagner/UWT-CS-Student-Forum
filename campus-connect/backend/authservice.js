/** This code creates an Express router that handles the /login POST route. When a user attempts to log in,
 *  their username and password are compared against those in the database. If the credentials are valid,
 *  a JWT is generated and sent back to the user. This JWT can be used for authenticating subsequent requests from the user.
 *  The use of bcrypt ensures that the password comparison is secure, even if the passwords stored in the database are hashed. */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConnection = require('./config'); // Ensure this is the path to your config file

const router = express.Router();

// POST route for user login
// URI: http://localhost:port/api/auth/login
router.post('/login', (req, res) => {
    const { UserName, UserPassword } = req.body;

    dbConnection.query('SELECT * FROM Users WHERE UserName = ?', [UserName], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if the provided password matches the one in the database
        const user = results[0];
        if (UserPassword !== user.UserPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If password matches, create a JWT for the user
        const userType = results[0].UserType; // Assuming UserType is the column name in your Users table
        const token = jwt.sign(
          { userId: user.User_ID, role: userType },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );        

        // Send the token back to the user
        res.json({ message: 'Login successful', token });
    });
});

// Export the router so it can be used in the main server file (index.js)
module.exports = router;

