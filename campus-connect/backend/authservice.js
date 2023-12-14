
const express = require('express');

const jwt = require('jsonwebtoken');
const dbConnection = require('./config'); 

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
        const userType = results[0].UserType; 
        const token = jwt.sign(
          { userId: user.User_ID, role: userType },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );        

        // Send the token back to the user
        res.json({ message: 'Login successful', token });
    });
});

 /**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authorization Webservice
 *
 * /api/auth/login:
 *   post:
 *     summary: allows the user to login returning jwt token
 *     description: generates a jwt token for the user given proper credentials.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserName:
 *                 type: string
 *                 example: "blex49"
 *               UserPassword:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - UserName
 *               - UserPassword
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Message: "Login successful"
 *               token: "generated jwt token"
 *       '401':
 *         description: Failed database authentication response
 *       '500':
 *         description: Database Error 
 */

module.exports = router;

