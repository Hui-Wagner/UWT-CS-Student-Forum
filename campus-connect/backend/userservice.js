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
// URI: http://localhost:port/users/:username
app.post("/users/:username", (request, response) => {
    const sqlQuery = "INSERT INTO users (username, userpassword, email, usertype) VALUES (?);";
    const values = [
      request.body.username,
      request.body.userpassword,
      request.body.email,
      request.body.usertype
    ];
  
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
  // (2) retrieve info for a specific user
  // root URI: http://localhost:port/users/:username
  app.get("/users/:username", (request, response) => {
    const userName = request.params.username;
    const sqlQuery = "SELECT * FROM users WHERE username = '" + userName + "';";
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
  // (3) update the info for a user(update of id is not permitted )
  // city URI: http://localhost:port/users/:username
  app.put("/users/:username", (request, response) => {
    const userName = request.params.username;
    
    const sqlQuery = `UPDATE users SET username = ?, 
      email = ?, userpassword = ?
      WHERE username = ? ;`;
    const values = [
      request.body.username,
      request.body.email,
      request.body.userpassword
    ];
  
    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, userName], (err, result) => {
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
  // (4) Delete a user by user name
  // note: deletion is by userName, it is important that no duplicate usernames are allowed
  // make sure we designate username to be unique in database
  // city URI: http://localhost:port/users/:username
  app.delete("/users/:username", (request, response) => {
    const userName = request.params.username;
    const sqlQuery = "DELETE FROM users WHERE username = ? ; ";
    dbConnection.query(sqlQuery, albumName, (err, result) => {
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
  


module.exports = app;