// ----------------------------------------------
// TCSS 460: Autumn 2023
// Backend REST Service Module
// User Service
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

var app = express(express.json);

app.use(cors());
app.use(bodyParser.json());


// Import the authentication middleware
const { authenticateJWT, authorizeRole } = require('./authMiddleware');
const { JsonWebTokenError } = require("jsonwebtoken");

//WEBSERVICE #1: User Management Service
// Methods:
// POST: Create a new user
// GET: Retrieve user information
// PUT: Update user details
// DELETE: Delete a user account

// ----------------------------------------------
// (1) create a new user
// Note: user id is auto incremented so there is no need to pass
// a value for the id attribute
// URI: http://localhost:port/campus-connect/users
app.post("/campus-connect/users", (request, response) => {
    const sqlQuery = "INSERT INTO users (username, userpassword, email, usertype) VALUES (?);";
    
    values = [
      request.body.username,
      request.body.userpassword,
      request.body.email,
      request.body.usertype
    ]
    dbConnection.query(sqlQuery, [values], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: User was not added." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: User was added!." });
    });
  });
  
  // ----------------------------------------------
  // (2) retrieve username given user id
  // root URI: http://localhost:port/campus-connect/users/id/:userID
  // can be used to get the username for a user id
  // do not want to expose users sensitive information!!
  app.get("/campus-connect/users/id/:userID", (request, response) => {
    const userID = request.params.userID;
    const sqlQuery = "SELECT username FROM users WHERE user_id = '" + userID + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("UserId", userID); // send a custom
      return response.status(200).json(result);
    });
  });
  
  // ----------------------------------------------
  // (3) retrieve the number of users with the same email
  // can use to see if there is already a user with the same email
  // root URI: http://localhost:port/campus-connect/users/email/:userEmail
  // do not want to expose the users password or email!!
  app.get("/campus-connect/users/email/:userEmail", (request, response) => {
    const userEmail = request.params.userEmail;
    const sqlQuery = "SELECT COUNT(*) as 'total' FROM users WHERE email = '" + userEmail + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("UserEmail", userEmail); // send a custom
      return response.status(200).json(result);
    });
  });

 
  // ----------------------------------------------
  // (4) retrieve the number of users with a username
  // can use to see if there is already a user with the same username
  // root URI: http://localhost:port/campus-connect/users/username/:userName
  // do not want to expose the users password or email!!
  app.get("/campus-connect/users/username/:userName", (request, response) => {
    const userName = request.params.userName;
    const sqlQuery = "SELECT COUNT(*) as 'total' FROM users WHERE username = '" + userName + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("UserName", userName); // send a custom
      return response.status(200).json(result);
    });
  });

  // ----------------------------------------------
  // (5) update the info for a user(update of id is not permitted )
  // can be used to let the user update their own information
  //admin will not be allowed to edit
  // city URI: http://localhost:port/campus-connect/users/update
  app.patch("/campus-connect/users/update", authenticateJWT, authorizeRole([1]),  (request, response) => {
    const userId = request.user.userId;
    
    const newAtributes = request.body;
    let values = [];

    //build the update query
    let sqlQuery = `UPDATE users SET `
    let temp = [];

    const permittedAttributes = ["username", "userpassword", "email"];
    //add attrubutes and values
    for(var key in newAtributes){
      let normKey = key.toLowerCase();
      console.log(key)
      if(permittedAttributes.includes(normKey)){
        let attr = normKey + ` =  ?` ;
        temp.push(attr);
        values.push(newAtributes[key]);
      }else{
        return response
               .status(400)
               .json({ Error: "Failed: invalid attributes" });
      }
    }
    let setString = temp.join(`, `);
    sqlQuery += setString + ` WHERE user_id = ?`

    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, userId], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: User was not updated." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: User was updated!." });
    });
  });
  
   // ----------------------------------------------
  // (6) create a new admin
  // used for the admin to change users roles
  //only admin may change a userstype
  // city URI: http://localhost:port/campus-connect/users/update/role/:userid
  app.patch("/campus-connect/users/update/role/:userid", authenticateJWT, authorizeRole([2]),  (request, response) => {
    const userId = request.params.userid;
    
    const sqlQuery = `UPDATE users SET usertype = ?
     WHERE user_id = ? ;`;
    const values = [
      request.body.usertype,
    ];
  
    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, userId], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: User was not updated." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: User was updated!." });
    });
  });
  
  // ----------------------------------------------
  // (7) Delete a user by user name, only user can use this one(to delete their own account)
  // note: deletion is by userName, it is important that no duplicate usernames are allowed
  // might run into issues while user is signed in, further testing is needed
  // city URI: http://localhost:port/campus-connect/users
  app.delete("/campus-connect/users", authenticateJWT, authorizeRole([1]), (request, response) => {
    const user_Id = request.user.userId;
    console.log("adjkasdbas");
    const sqlQuery = "DELETE FROM users WHERE user_id = ?;";
    dbConnection.query(sqlQuery, user_Id, (err, result) => {
      if (err) {
        console.log(err);
        return response
          .status(400)
          .json({ Error: "Failed: User was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: User was deleted!" });
    });
  });

   // ----------------------------------------------
  // (8) Delete a user by user name, only admin can use this one
  // city URI: http://localhost:port/campus-connect/users/:username
  app.delete("/campus-connect/users/:username", authenticateJWT, authorizeRole([2]), (request, response) => {
    const userName = request.params.username;
    const sqlQuery = "DELETE FROM users WHERE userName = ?;";
    dbConnection.query(sqlQuery, userName, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: User was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: User was deleted!" });
    });
  });
  
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Webservice
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         User_ID:
 *           type: integer
 *         UserName:
 *           type: string
 *         UserPassword:
 *           type: string
 *         Email:
 *           type: string
 *         UserType:
 *           type: integer
 */

/**
 * @swagger
 * /campus-connect/users:
 *   post:
 *     summary: create a new user for the website
 *     description: can be used for account creation
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "username"
 *               userpassword:
 *                 type: string
 *                 example: "password"
 *               email:
 *                 type: string
 *                 example: "email"
 *               usertype:
 *                 type: string
 *                 example: "1"
 *             required:
 *               - content
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: User was added!"
 *       '400':
 *         description: Failed response
 */

/**
 * @swagger
 * /campus-connect/users/id/{userID}:
 *   get:
 *     tags: [User]
 *     summary: retrieve the username for a user given username
 *     description: 
 *       retrieve username for a specific user given user id
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: id of the user
 *         type: string
 *     responses:
 *       '200':
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User' 
 *                 
 *       '400':
 *         description: Failed response 
 */

/**
 * @swagger
 * /campus-connect/users/email/{userEmail}:
 *   get:
 *     tags: [User]
 *     summary: retrieve the number of users  for a given email(should be 1 or 0)
 *     description: 
 *       can be used to make sure a user doesnt create an account with a duplicate email
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         description: user email to search for
 *         type: string
 *     responses:
 *       '200':
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User' 
 *                 
 *       '400':
 *         description: Failed response 
 */

 /**
 * @swagger
 * /campus-connect/users/username/{userName}:
 *   get:
 *     tags: [User]
 *     summary: retrieve the number of users  for a given username(should be 1 or 0)
 *     description: 
 *       can be used to make sure a user doesnt create an account with a duplicate username
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         description: username to search
 *         type: string
 *     responses:
 *       '200':
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *                  total:
 *                  type: integer
 *                  example: 1
 *       '400':
 *         description: Failed response 
 */

   /**
 * @swagger
 * /campus-connect/users/update:
 *   patch:
 *     tags: [User]
 *     summary: Update users information
 *     description: Can be used to allow the user to edit their account, userid is passed via jwt token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: User was updated!."
 *       '400':
 *         description: Failed response
 */

/**
 * @swagger
 * /campus-connect/users/update/role/{userid}:
 *   patch:
 *     tags: [User]
 *     summary: changes any users type, need to be admin to use
 *     description: Admin has the ability to create moderators or more admins
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usertype:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: User was updated!."
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: invalid credentials
 */

 /**
 * @swagger
 * /campus-connect/users:
 *   delete:
 *     tags: [User]
 *     summary: deletes the logged in user
 *     description: allows the user to delete their account(should be logged out quickly to prevent issues)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: User was deleted!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized error response
 */

    /**
 * @swagger
 * /campus-connect/users/{username}:
 *   delete:
 *     tags: [User]
 *     summary: admin can use this endpoint to delete a user(by username)
 *     description: allows admin to delete an account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: username to delete
 *         type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Success: "Successful: User was deleted!"
 *       '400':
 *         description: Failed response
 *       '401':
 *         description: Unauthorized error response
 */
module.exports = app;