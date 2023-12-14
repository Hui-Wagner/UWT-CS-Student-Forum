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

// Import the authentication middleware
const { authenticateJWT, authorizeRole } = require('./authMiddleware');
const { JsonWebTokenError } = require("jsonwebtoken");
// ----------------------------------------------
// (1) Get: Get the forums list from the database
// ****This is used to show on the home/main page ****
// URI: http://localhost:port/forums
// ----------------------------------------------

app.get("/forums", (req, res) => {
    // SQL Query to select all subforums from the database
    const sqlQuery = "SELECT * FROM SubForums";

    // Execute the query
    dbConnection.query(sqlQuery, (err, results) => {
        if (err) {
            // If there is an error, send a 500 status code (Internal Server Error)
            return res.status(500).json({ Error: "Failed to fetch subforum list." });
        }
        // If everything is okay, send the results with a 200 status code (OK)
        return res.status(200).json(results);
    });
});

// ----------------------------------------------
// (2) Get: Get the subforum list from the database
// **** This is used to show on the one particular forum page ****
// URI: http://localhost:port/forums/:SubForumID
// ----------------------------------------------

app.get("/forums/posts/:SubForumID", (req, res) => {
    // SQL Query to select all posts from the database where the SubForumID matches
    const sqlQuery = "SELECT * FROM Posts WHERE SubForumID = ?";
  
    // Execute the query to get the posts
    dbConnection.query(sqlQuery, [req.params.SubForumID], (err, results) => {
      if (err) {
        // If there is an error, send a 500 status code (Internal Server Error)
        return res.status(500).json({ Error: "Failed to fetch posts for subforum." });
      }
      
      // SQL Query to update the view count for the subforum
      const updateViewCount = "UPDATE SubForums SET ViewCount = ViewCount + 1 WHERE SubForumID = ?";
  
      // Execute the query to update the view count
      dbConnection.query(updateViewCount, [req.params.SubForumID], (updateErr, updateResults) => {
        if (updateErr) {
          // If there is an error updating the view count, send a 500 status code (Internal Server Error)
          // Note: The post list is still sent to the client even if view count fails to update
          console.error("Failed to update view count for subforum: ", updateErr);
        }
      });
  
      // Send the post list with a 200 status code (OK)
      return res.status(200).json(results);
    });
  });

  // ----------------------------------------------
  // (3) retrive the information on a specific subforum
  // root URI: http://localhost:port/forums/:SubForumID
  // no auth required
  app.get("/forums/:SubForumID", (request, response) => {
    const subForumId = request.params.SubForumID;
    const sqlQuery = "SELECT * FROM subforums WHERE subforumid = '" + subForumId + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("SubForumID", subForumId); // send a custom
      return response.status(200).json(result);
    });
  });

  // ----------------------------------------------
  // (4) create a new subforum
  // root URI: http://localhost:port//campus-connect/posts
  // no auth required
  app.post("/forums", authenticateJWT, authorizeRole([1,2]), (request, response) => {

    // Insert sql statement
    const sqlQuery = "INSERT INTO subforums (name, description, creatorid) VALUES (?, ?, ?);";
    const values = [
      request.body.name,
      request.body.description,
      request.user.userId, // Use userId from JWT
    ];
  
    dbConnection.query(sqlQuery, values, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: subforum was not added." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: subforum was added!", SubForumID: result.insertId });
    });
  });

  // ----------------------------------------------
  // (5) update the info for a subforum
  // URI: http://localhost:port/forums/:SubForumID
  app.put("/forums/:SubForumID",authenticateJWT, authorizeRole([1,2]), async (request, response) => {
    const subForumId = request.params.SubForumID;
    
    
    //authenticate that the user made this subforum
    url = `http://localhost:3000/forums/${subForumId}` //need to create this
    let replyResponse = await fetch(url, {
        method:'GET'
    })

    //retreive user id for creator
    let replyData = await replyResponse.json()
    console.log(replyData);
    let reply = replyData[0];
    let creatorId = reply["CreatorID"];

    //check to see if userid matches to logged in user
    if(creatorId != request.user.userId){
      return response
        .status(401)
        .json({ Error: "Unauthorized: invalid user" });
    }
    
    //perform update
    const sqlQuery = `UPDATE subforums SET name = ?, description = ?
      WHERE subforumid = ? ;`;
    const values = [
      request.body.name,
      request.body.description
    ];
  
    //console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, subForumId], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Subforum was not edited." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: Subforum was edited!." });
    });
  });

  // ----------------------------------------------
  // (6) Delete a subforum by its id
  //only original post creator whould allowed to delete the post
  app.delete("/forums/:SubForumID",authenticateJWT, authorizeRole([1,2]), async (request, response) => {
    const subForumId = request.params.SubForumID;

    //If user is not an admin then check to see if they created the post
    if(request.user.role == 1){
      //authenticate that the user made this subforum
      url = `http://localhost:3000/forums/${subForumId}` //need to create this
      let replyResponse = await fetch(url, {
          method:'GET'
      })

      //retreive user id for creator
      let replyData = await replyResponse.json();
      let reply = replyData[0];
      console.log("asdasdasdasds")
      let creatorId = reply["CreatorID"];

      //check to see if userid matches to logged in user
      if(creatorId != request.user.userId){
        return response
          .status(401)
          .json({ Error: "Unauthorized: invalid user" });
      }
    }
    
    //proceed with deletion
    const sqlQuery = "DELETE FROM subforums WHERE subforumid = ? ; ";
    dbConnection.query(sqlQuery, subForumId, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: subforum was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Successful: subforum was deleted!" });
    });
  });
  
//swagger doc
/**
 * @swagger
 * tags:
 *   name: Subforum
 *   description: Subforum Webservice
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Subforum:
 *       type: object
 *       properties:
 *         SubForumId:
 *           type: integer
 *         Name:
 *           type: string
 *         Description:
 *           type: string
 *         ViewCount:
 *           type: integer
 *         CreatorID:
 *           type: string
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
 * /forums:
 *   get:
 *     tags: [Subforum]
 *     summary:  return all the subforums for the website
 *     description: 
 *       returns all subforums
 *     responses:
 *       '200':
 *         description: Success, returns an array of subforums as objects
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subforum'                  
 *       '500':
 *         description: database error
 */

 /**
 * @swagger
 * /forums/posts/{SubForumID}:
 *   get:
 *     tags: [Subforum]
 *     summary:  retrieve all posts for a specfic subforum
 *     description: 
 *       returns all posts in a subforum
 *     parameters:
 *       - in: path
 *         name: SubForumID
 *         required: true
 *         description: ID of subforum
 *         type: string
 *         example: "1"
 *     responses:
 *       '200':
 *         description: Success, returns an array of posts for  subforum as objects
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'                  
 *       '500':
 *         description: database error
 */

/**
 * @swagger
 * /forums/{SubForumID}:
 *   get:
 *     tags: [Subforum]
 *     summary:  retrieve the information on a specific subforum
 *     description: 
 *       retrive the information on a specific subforum given the id
 *     parameters:
 *       - in: path
 *         name: SubForumID
 *         required: true
 *         description: ID of subforum
 *         type: string
 *         example: "1"
 *     responses:
 *       '200':
 *         description: Success, returns an array(length 1) of a single subforum object
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'                  
 *       '400':
 *         description: Failed Response
 */

 /**
 * @swagger
 * /forums:
 *   post:
 *     summary: Create a new Subforum
 *     description: Creates a new Subforum for the website.
 *     tags: [Subforum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "name of subforum"
 *               description:
 *                 type: string
 *                 example: "description of the subforum"
 *             required:
 *               - name
 *               - description
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: subforum was added!"
 *       '400':
 *         description: Failed response
 */

 /**
 * @swagger
 * /forums/{SubForumID}:
 *   put:
 *     tags: [Subforum]
 *     summary: Update Subforum information
 *     description: Update the name and/or description of a subforum
 *     parameters:
 *       - in: path
 *         name: SubForumID
 *         required: true
 *         description: id of the subforum to update.
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "same name as before"
 *               description:
 *                 type: string
 *                 example: "edited description"
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Subforum was edited!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized response
 */

   /**
 * @swagger
 * /forums/{SubForumID}:
 *   delete:
 *     tags: [Subforum]
 *     summary: Delete a Subforum given its id, requires auth
 *     description: Deletes a Subforum from the database. Only the original post creator or an admin is allowed to delete.
 *     parameters:
 *       - in: path
 *         name: SubForumID
 *         required: true
 *         description: ID of the subforum to delete.
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: subforum was deleted!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized error response
 */
module.exports = app;