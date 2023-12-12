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



//WEBSERVICE #3: reply service
// ----------------------------------------------
// (1) create a reply for a post
// URI: http://localhost:port/posts/:postid/reply
app.post("/posts/:postid/responce", (request, response) => {
    const sqlQuery = "INSERT INTO posts VALUES (?);";
    const values = [
      request.body.postid,
      request.body.userid,
      request.body.content,
      request.body.respncedate
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
  // root URI: http://localhost:port/posts/:postid/responce
  app.get("/posts/:postid/responce", (request, response) => {
    const postid = request.params.postid;
    const sqlQuery = "SELECT * FROM responses WHERE postid = '" + postid + "' ORDER BY responcedate ASC;";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("postId", postid); // send a custom, might wish to change
      return response.status(200).json(result);
    });
  });
  
  // ----------------------------------------------
  // (3) update the info for a reply
  // city URI: http://localhost:port/vinyl/:album/price
  app.put("/posts/:postid/responce/:responceid", (request, response) => {
    const postid = request.params.postid;
    
    const sqlQuery = `UPDATE responces SET content = ?
      WHERE responceid = ? ;`;
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