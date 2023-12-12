// ----------------------------------------------
// TCSS 460: Autumn 2023
// reply service
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
const { authenticateJWT, authorizeRole } = require("./authMiddleware");

// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);


// ----------------------------------------------
// (1) create a reply for a post
// URI: http://localhost:port/campus-connect/replies/:postid
app.post("/campus-connect/replies/:postid", authenticateJWT, authorizeRole([1,2,3]), (request, response) => {
    let postid = request.params.postid
    const sqlQuery = "INSERT INTO responses (postid, userid, content, responcedate) VALUES (?);";
    const values = [
      postid,
      request.user.userId,
      request.body.content,
      new Date() //current time
    ];
  
    dbConnection.query(sqlQuery, [values], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: reply was not added." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: reply was added!." });
    });
  });
  
  // ----------------------------------------------
  // (2) retrieve all replies for a post sorted by time created

  // root URI: http://localhost:port/campus-connect/replies/:postid
  app.get("/campus-connect/replies/:postid", (request, response) => {
    const postId = request.params.postid;
    const sqlQuery = "SELECT * FROM responses WHERE postid = '" + postId + "' ORDER BY responcedate ASC;";

    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("postId", postId); // send a custom
      return response.status(200).json(result);
    });
  });
  
  // ----------------------------------------------
  // (3) retrieve info for a specific reply/response
  // root URI: http://localhost:port/campus-connect/replies/single/:replyid
  app.get("/campus-connect/replies/single/:replyid", (request, response) => {
    const replyId = request.params.replyid;
    const sqlQuery = "SELECT * FROM responses WHERE responseid = '" + replyId + "' ORDER BY responcedate ASC;";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("replyid", replyId); // send a custom
      return response.status(200).json(result);
    });
  });

  // ----------------------------------------------
  // (4) update the info for a reply
  // URI: http://localhost:port/campus-connect/replies/edit/:replyid
  app.put("/campus-connect/replies/edit/:replyid",authenticateJWT, authorizeRole([1]), async (request, response) => {
    const replyId = request.params.replyid;
    
    
    //authenticate that the user made this post
    url = `http://localhost:3000/campus-connect/replies/single/${replyId}`
    let replyResponse = await fetch(url, {
        method:'GET'
    })

    //retreive user id for creator
    let replyData = await replyResponse.json()
    let reply = replyData[0]
    let creatorId = reply["UserID"]

    //check to see if userid matches to logged in user
    if(creatorId != request.user.userId){
      return response
        .status(401)
        .json({ Error: "Unauthorized: invalid user" });
    }
    
    //perform update
    const sqlQuery = `UPDATE responses SET content = ?
      WHERE responseid = ? ;`;
    const values = [
      request.body.content
    ];
  
    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, replyId], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Reply was not edited." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: Reply was edited!." });
    });
  });
  
  // ----------------------------------------------
  // (5) Delete a post by post id
  // URI: http://localhost:port/campus-connect/replies/single/:replyid
  app.delete("/campus-connect/replies/single/:replyid",authenticateJWT, authorizeRole([1,2]), async (request, response) => {
    const replyId = request.params.replyid;

    //If user is not an admin then check to see if they created the post
    if(request.user.role == 1){
      //If user is not an admin then check to see if they created the post
      //retrieve the post info to check who created the post
      url = `http://localhost:3000/campus-connect/replies/single/${replyId}`
      let replyResponse = await fetch(url, {
          method:'GET'
      })

      //retrieve user id for creator
      let replyData = await replyResponse.json()
      let reply = replyData[0]
      let creatorId = reply["UserID"]

      //check to see if userid matches to logged in user
      if(creatorId != request.user.userId){
        return response
          .status(401)
          .json({ Error: "Unauthorized: invalid user" });
      }
    }
    
    //proceed with deletion
    const sqlQuery = "DELETE FROM responses WHERE responseid = ? ; ";
    dbConnection.query(sqlQuery, replyId, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Reply was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: Reply was deleted!" });
    });
  });

//swagger doc comments
/**
 * @swagger
 * tags:
 *   name: Reply
 *   description: Reply Webservice
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Response:
 *       type: object
 *       properties:
 *         ResponseID:
 *           type: integer
 *         PostID:
 *           type: integer
 *         UserID:
 *           type: integer
 *         Content:
 *           type: string
 *         ResponceDate:
 *           type: string
 */

/**
 * @swagger
 * /campus-connect/replies/{postid}:
 *   post:
 *     summary: create a reply for a post
 *     description: creates a new response in the database(reply to a post)
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post to reply to
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "wow that was great!"
 *             required:
 *               - content
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: reply was added!"
 *       '400':
 *         description: Failed response
 */

  /**
 * @swagger
 * /campus-connect/replies/{postid}:
 *   get:
 *     tags: [Reply]
 *     summary: Retrieve all replies for a post
 *     description: 
 *       Retrieves responses for a specific post in database.
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post 
 *         type: string
 *     responses:
 *       '200':
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Response' 
 *                 
 *       '400':
 *         description: Failed response in case of an error
 */

/**
 * @swagger
 * /campus-connect/replies/single/{replyid}:
 *   get:
 *     tags: [Reply]
 *     summary: Retrieve a singular reply/response but its id
 *     description: 
 *       Retrieves a specific response in database.
 *     parameters:
 *       - in: path
 *         name: replyid
 *         required: true
 *         description: ID of the reply 
 *         type: string
 *         example: "1"
 *     responses:
 *       '200':
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Response'                  
 *       '400':
 *         description: Failed response in case of an error
 */

  /**
 * @swagger
 * /campus-connect/replies/edit/{replyid}:
 *   put:
 *     tags: [Reply]
 *     summary: Update reply content, can use to allow users to edit responses/replies
 *     description: can be used to edit a reply to a post
 *     parameters:
 *       - in: path
 *         name: replyid
 *         required: true
 *         description: id of the reply to update.
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
 *               content:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Reply was edited!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized response
 */

  /**
 * @swagger
 * /campus-connect/replies/single/{replyid}:
 *   delete:
 *     tags: [Reply]
 *     summary: Delete a reply by reply ID
 *     description: Deletes a response/reply from the database. Only the original creator or an admin is allowed to delete.
 *     parameters:
 *       - in: path
 *         name: replyid
 *         required: true
 *         description: ID of the response(reply) to delete.
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Reply was deleted!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized error response
 */
  module.exports = app;