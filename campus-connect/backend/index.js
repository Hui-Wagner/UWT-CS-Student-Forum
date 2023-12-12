// ----------------------------------------------
// TCSS 460: Autumn 2023
// Backend REST Service Module
// ----------------------------------------------
// Express is a Node.js web application framework
// that provides a wide range of APIs and methods
// Express API Reference:
// https://expressjs.com/en/resources/middleware/cors.html


//configure dotenv in main server file
require('dotenv').config();


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

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
    },
    servers:[
      {
      url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['userservice.js', 'postsservice.js', 'replyservice.js', 'searchservice.js', 'subforumservice.js'], // Path to your route files
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Mounting 'authservice' at '/api/auth' namespaces our authentication routes.
// This avoids conflicts with similarly named routes in other services
// and allows for easy extension and middleware integration specific to auth.
const authservice = require("./authservice");
app.use('/api/auth', authservice);

//link to postsservice
const postsservice = require("./postsservice");
app.use(postsservice);


//link to userservice
const userservice = require("./userservice");
app.use(userservice);

//link to replyservice
const replyservice = require("./replyservice");
app.use(replyservice);


//link to likedislikeservice
const likedislikeservice = require("./likedislikeservice");
app.use(likedislikeservice);

//link to moderationservice
const moderationservice = require("./moderationservice");
app.use(moderationservice);

//link to searchservice
const searchservice = require("./searchservice");
app.use(searchservice);

//link to subforumservice
const subforumservice = require("./subforumservice");
app.use(subforumservice);

//link to subservice
const subservice = require("./subservice");
app.use(subservice);


 
  /**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API operations related to posts
 * 
 * securityDefinitions:
 *   BearerAuth:
 *     type: apiKey
 *     in: header
 *     name: Authorization
 * 
 * /campus-connect/posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post in the Campus Connect application.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token (including the word 'Bearer' followed by a space and the token)
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subforumid:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *             required:
 *               - subforumid
 *               - title
 *               - content
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: post was added!"
 *               postId: 123
 *       '400':
 *         description: Failed response
 *         content:
 *           application/json:
 *             example:
 *               Error: "Failed: post was not added."
 * 
 * /campus-connect/posts/{postid}:
 *   get:
 *     tags: [Posts]
 *     summary: Retrieve information for a specific post
 *     description: |
 *       Retrieves information for a specific post in the Campus Connect application.
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post to retrieve
 *         type: string
 *     responses:
 *       '200':
 *         description: Successful response with an array of post information
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Post'
 *       '400':
 *         description: Failed response in case of an error
 *         schema:
 *           $ref: '#/definitions/Error'
 * definitions:
 *   Post:
 *     type: object
 *     properties:
 *       postid:
 *         type: integer
 *       SubForumId:
 *         type: integer
 *       UserId:
 *         type: integer
 *       Title:
 *         type: string
 *       Content:
 *         type: string
 *       PostDate:
 *         type: string
 *   Error:
 *     type: object
 *     properties:
 *       Error:
 *         type: string
 */

 /**
 * @swagger
 * /campus-connect/posts/{postid}:
 *   patch:
 *     tags: [Posts]
 *     summary: Update post information
 *     description: Update the information, title, or content of a post.
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post to update.
 *         type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token (including the word 'Bearer' followed by a space and the token)
 *         type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subforumid:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Post was edited!"
 *       '400':
 *         description: Failed response
 *         content:
 *           application/json:
 *             example:
 *               Error: "Failed: Post was not edited."
 *               AuthError: "Failed: Invalid attributes, please only use title and/or content."
 *       '401':
 *         description: Unauthorized response
 *         content:
 *           application/json:
 *             example:
 *               Error: "Unauthorized: Invalid user."
 */

 /**
 * @swagger
 * /campus-connect/posts/{postid}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post by post ID
 *     description: Deletes a post in the Campus Connect application. Only the original post creator or an admin is allowed to delete.
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post to delete.
 *         type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Post was deleted!"
 *       '400':
 *         description: Failed response
 *         content:
 *           application/json:
 *             example:
 *               Error: "Failed: Post was not deleted."
 *       '401':
 *         description: Unauthorized response
 *         content:
 *           application/json:
 *             example:
 *               Error: "Unauthorized: Invalid user."
 */
// ----------------------------------------------
// Ref: https://expressjs.com/en/4x/api.html#app
// (C)  Create a server such that it binds and
//      listens on a specified host and port.
//      We will use default host and port 3000.
app.listen(3000, () => {
  console.log("Express server is running and listening");
});
