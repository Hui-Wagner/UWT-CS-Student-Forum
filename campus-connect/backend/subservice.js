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
// (1) create a subscription
// URI: http://localhost:port/campus-connect/subscription/:postid
app.post("/campus-connect/subscription/:postid", authenticateJWT, authorizeRole([1,3]), (request, response) => {
    let postid = request.params.postid
    const sqlQuery = "INSERT INTO postsubscriptions (subscriberid, postid, timecreated) VALUES (?);";
    const values = [
      request.user.userId,
      postid,
      new Date() //current time
    ];
  
    dbConnection.query(sqlQuery, [values], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: subscription was not created!." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: subscription was created!." });
    });
  });


    // ----------------------------------------------
  // (2) Delete a post by post id
  // URI: http://localhost:port/campus-connect/replies/single/:replyid
  app.delete("/campus-connect/subscription/:postid",authenticateJWT, authorizeRole([1,2,3]), async (request, response) => {
    const postId = request.params.postid;

    values = [
        postId,
        request.user.userId, // Use userId from JWT
    ]
    
    //proceed with deletion
    const sqlQuery = "DELETE FROM postsubscriptions WHERE postid = ? AND subscriberid = ?; ";
    dbConnection.query(sqlQuery, values, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Subscription was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: Subscription was deleted!" });
    });
  });

//swagger docs
/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription Webservice
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         SubcriptionId:
 *           type: integer
 *         SubscriberID:
 *           type: integer
 *         PosID:
 *           type: integer
 *         TimeCreated:
 *           type: string
 */

/**
 * @swagger
 * /campus-connect/subscription/{postid}:
 *   post:
 *     summary: create a subscription to a post
 *     description: allows the user to subscribe to a post
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: ID of the post to reply to
 *         type: string
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
 * /campus-connect/subscription/{postid}:
 *   delete:
 *     tags: [Subscription]
 *     summary: allows a user to delete on of their a subscriptions
 *     description: allows a user to delete on of their a subscriptions. Can be used to remove subscriptions
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         description: id of post to identify the subscription to be deleted
 *         type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: Subscription was deleted!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized error response
 */
module.exports = app;