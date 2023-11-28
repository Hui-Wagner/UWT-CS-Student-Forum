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
  // (1) PUT: Mark a post as inappropriate or spam
  // URI: http://localhost:port/mod/
  app.put("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
    
    const sqlQuery = `UPDATE users SET content = ?
      WHERE postid = ? ;`;
    const values = [
      request.body.content
    ];
  
    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, postid], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Post was not edited." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: Post was edited!." });
    });
  });



module.exports = app;