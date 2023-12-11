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
          .json({ Error: "Failed: post was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: post was deleted!" });
    });
  });


  module.exports = app;