// ----------------------------------------------
// TCSS 460: Autumn 2023
// Backend REST Service Module
// ----------------------------------------------
// Express is a Node.js web application framework
// that provides a wide range of APIs and methods
// Express API Reference:
// https://expressjs.com/en/resources/middleware/cors.html

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

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search Webservice
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         postid:
 *           type: integer
 *         SubForumId:
 *           type: integer
 *         UserId:
 *           type: integer
 *         Title:
 *           type: string
 *         Content:
 *           type: string
 *         PostDate:
 *           type: string
 */

/**
 * @swagger
 * /search/{keyword}:
 *   get:
 *     tags: [Search]
 *     summary:  Search the content of the all the posts in the database of their title and post content
 *     description: 
 *       Search posts title and content by keywords
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         description: keyword to be searched for 
 *         type: string
 *         example: "tcss"
 *     responses:
 *       '200':
 *         description: Success, returns an array of posts as objects
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'                  
 *       '500':
 *         description: database error
 */
// Search the content of the all the posts in the database of their title and post content
// ----------------------------------------------
// (4) Get: Search posts title and content by keywords
// URI: http://localhost:port/search/:keyword
// ----------------------------------------------

app.get("/search/:keyword", (req, res) => {
    // Use placeholders in the query for security (to prevent SQL injection)
    const searchQuery = "SELECT * FROM Posts WHERE Title LIKE ? OR Content LIKE ?";
  
    // Use "%" to denote that the keyword can be anywhere in the title or content
    const keyword = `%${req.params.keyword}%`;
  
    // Execute the query
    dbConnection.query(searchQuery, [keyword, keyword], (err, results) => {
      if (err) {
        // If there is an error, send a 500 status code (Internal Server Error)
        console.error("Error searching for posts:", err);
        return res.status(500).json({ Error: "Failed to search for posts." });
      }
  
      // If everything is okay, send the results with a 200 status code (OK)
      res.status(200).json(results);
    });
  });
  




module.exports = app;