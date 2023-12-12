// ----------------------------------------------
// retrieve necessary files (express and cors)
const express = require("express");
const cors = require("cors");
// retrieve the MySQL DB Configuration Module
const dbConnection = require("./config");
// use this library for parsing HTTP body requests
var bodyParser = require("body-parser");

// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);

// ----------------------------------------------
// (B)  Use the epxress cors middleware
//      Cross-origin resource sharing (CORS)
//      is a technique that restricts specified
//      resources within web page to be accessed
//      from other domains on which the origin
//      resource was initiated the HTTP request
//      Also use the bodyParser to parse in
//      format the body of HTTP Requests
// ----------------------------------------------
app.use(cors());
app.use(bodyParser.json());
// Any logined user can like or dislike a post
// When click a like or dislike button, the post upvote button will be updated in time
// put method


// Import the authentication middleware
const { authenticateJWT, authorizeRole } = require('./authMiddleware');



// ----------------------------------------------
// (4) Patch: Update post upvote count by postID (Partially update the info of a post)
// URI: http://localhost:port/posts/upvote/:PostID
// ----------------------------------------------

app.patch("/posts/upvote/:PostID", authenticateJWT, (request, response) => {
  
    // Retrieve PostID from the URL parameters
    const postID = request.params.PostID;
  
    // Update the Upvotes for the post
    const sqlQuery = "UPDATE Posts SET Upvotes = Upvotes + 1 WHERE PostID = ?";
    dbConnection.query(sqlQuery, [postID], (err, result) => {
      if (err) {
        console.error("Error updating upvotes:", err);
        return response.status(500).json({ Error: "Failed to update upvotes for the post." });
      }
  
      if (result.affectedRows === 0) {
        // If no rows affected, it means the PostID does not exist
        return response.status(404).json({ Error: "Post not found or no upvote needed to be updated." });
      }
  
      // If everything is okay, send a 200 status code (OK)
      response.status(200).json({ Success: "Upvote incremented successfully." });
    });
  });

// ----------------------------------------------
// (4) Patch: Update post upvote count -1 by postID (Partially update the info of a post)
// URI: http://localhost:port/posts/downvote/:PostID
// ----------------------------------------------

app.patch("/posts/downvote/:PostID", authenticateJWT, (request, response) => {
  
    // Retrieve PostID from the URL parameters
    const postID = request.params.PostID;
  
    // Update the Upvotes for the post
    const sqlQuery = "UPDATE Posts SET Upvotes = Upvotes - 1 WHERE PostID = ?";
    dbConnection.query(sqlQuery, [postID], (err, result) => {
      if (err) {
        console.error("Error updating downvotes:", err);
        return response.status(500).json({ Error: "Failed to update downvotes for the post." });
      }
  
      if (result.affectedRows === 0) {
        // If no rows affected, it means the PostID does not exist
        return response.status(404).json({ Error: "Post not found or no downvote needed to be updated." });
      }
  
      // If everything is okay, send a 200 status code (OK)
      response.status(200).json({ Success: "downvote reduced successfully." });
    });
  });

/**
 * @swagger
 * tags:
 *   name: Upvote
 *   description: Like/Dislike Service
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /posts/upvote/{PostID}:
 *   patch:
 *     tags: [Upvote]
 *     summary: increment number of Upvotes for a specific post
 *     description: upvote a post
 *     parameters:
 *       - in: path
 *         name: PostID
 *         required: true
 *         description: id of the post.
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Upvote incremented successfully."
 *       '404':
 *         description: Post-not-Found response
 *       '500':
 *         description: Database error
 */

/**
 * @swagger
 * /posts/downvote/{PostID}:
 *   patch:
 *     tags: [Upvote]
 *     summary: decrement number of Upvotes for a specific post
 *     description: downvote a post
 *     parameters:
 *       - in: path
 *         name: PostID
 *         required: true
 *         description: id of the post.
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "downvote reduced successfully."
 *       '404':
 *         description: Post-not-Found response
 *       '500':
 *         description: Database error
 */

module.exports = app;