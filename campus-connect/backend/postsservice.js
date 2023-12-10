// ----------------------------------------------
// TCSS 460: Autumn 2023
<<<<<<< HEAD
// Backend REST Service Module
// ----------------------------------------------
// Express is a Node.js web application framework
// that provides a wide range of APIs and methods
// Express API Reference:
// https://expressjs.com/en/resources/middleware/cors.html

=======
// Author: Alex Garcia 
// Backend REST Service Module
// Post Service
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
// ----------------------------------------------
// retrieve necessary files (express and cors)
const express = require("express");
const cors = require("cors");
// retrieve the MySQL DB Configuration Module
const dbConnection = require("./config");
// use this library for parsing HTTP body requests
var bodyParser = require("body-parser");

<<<<<<< HEAD
=======
require('dotenv').config();
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);

<<<<<<< HEAD
//WEBSERVICE #2: Post Service
// handles manipulation of user posts
// Methods:
// POST: Create a new post
// GET: Retrieve post details
// PATCH: Edit an existing post
// DELETE: Remove a post

// ----------------------------------------------
// (1) create a new post
// Note: post id is auto incremented so no need to pass in, 
// upvotes, and viewcount are set to default values(0)
// URI: http://localhost:port/posts
app.post("/posts", (request, response) => {
    const sqlQuery = "INSERT INTO posts VALUES (?);";
    const values = [
      request.body.subforumid,
      request.body.userid,
      request.body.title,
      request.body.content,
      request.body.postdate
    ];
  
    dbConnection.query(sqlQuery, [values], (err, result) => {
=======
// Import the authentication middleware
const { authenticateJWT, authorizeRole } = require('./authMiddleware');
const { JsonWebTokenError } = require("jsonwebtoken");


//Routes

  // ----------------------------------------------
  // (1) create a new post
  // root URI: http://localhost:port//campus-connect/posts
  // no auth required
  app.post("/campus-connect/posts", authenticateJWT, authorizeRole([1,2,3]), (request, response) => {

    // Insert sql statement
    const sqlQuery = "INSERT INTO posts (SubForumId, UserId, Title, Content, PostDate) VALUES (?, ?, ?, ?, ?);";
    const values = [
      request.body.subforumid,
      request.user.userId, // Use userId from JWT
      request.body.title,
      request.body.content,
      new Date() //current time
    ];
  
    dbConnection.query(sqlQuery, values, (err, result) => {
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: post was not added." });
      }
      return response
        .status(200)
<<<<<<< HEAD
        .json({ Success: "Successful: post was added!." });
    });
  });
  
  // ----------------------------------------------
  // (2) retrive the information for a specific post
  // root URI: http://localhost:port/posts/:postid
  app.get("/posts/:postid", (request, response) => {
=======
        .json({ Success: "Successful: post was added!", postId: result.insertId });
    });
  });
  
  
  // ----------------------------------------------
  // (1) retrive the information for a specific post
  // root URI: http://localhost:port/campus-connect/posts/:postid
  // no auth required
  app.get("/campus-connect/posts/:postid", (request, response) => {
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
    const postid = request.params.postid;
    const sqlQuery = "SELECT * FROM posts WHERE postid = '" + postid + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("postId", postid); // send a custom
      return response.status(200).json(result);
    });
  });
  
<<<<<<< HEAD
  
  // ----------------------------------------------
  // (3) update the info for a post
  // city URI: http://localhost:port/vinyl/:album/price
  app.put("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
    
    const sqlQuery = `UPDATE users SET content = ?
      WHERE postid = ? ;`;
    const values = [
      request.body.content
    ];
  
    console.log(sqlQuery); // for debugging purposes:
=======

  // ----------------------------------------------
  // (2) update the info and/or the title and content of a post only
  //http://localhost:port/campus-connect/posts/:postid
  // auth required, only original poster or admin allowed to edit, possibly a moderator
  app.patch('/campus-connect/posts/:postid', authenticateJWT, authorizeRole([1,2]),  async (request,response) => {
    const postid = request.params.postid;

    //If user is not an admin then check to see if they created the post
    if(request.user.role == 1){
      //retrieve the post info to check who created the post
      url = `http://localhost:3000/campus-connect/posts/${postid}`
      let postResponse = await fetch(url, {
          method:'GET'
      })

      //retreive user id for creator
      let postResponceData = await postResponse.json()
      let post = postResponceData[0]
      let creatorId = post["UserID"]

      //check to see if userid matches to logged in user
      if(creatorId != request.user.userId){
        return response
          .status(401)
          .json({ Error: "Unathorized: invalid user" });
      }
    }
    
    const newAtributes = request.body;
    let values = [];

    //build the update query
    let sqlQuery = `UPDATE posts SET `
    let temp = [];

    //add attrubutes and values
    for(var key in newAtributes){
      if(key.toLocaleLowerCase() == "title" || key.toLocaleLowerCase() == "content"){
        let attr = key + ` =  ?` ;
        temp.push(attr);
        values.push(newAtributes[key]);
      }else{
        return response
               .status(400)
               .json({ Error: "Failed: invalid attributes, please only use title and/or content =" });
      }
    }
    let setString = temp.join(`, `);
    sqlQuery += setString + ` WHERE postid = ?`
  
   //console.log(sqlQuery); // for debugging purposes:
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
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
<<<<<<< HEAD
  });
  
  // ----------------------------------------------
  // (4) Delete a post by post id
  // make sure we designate username to be unique in database
  // city URI: http://localhost:port/vinyl/album
  app.delete("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
=======
  })

  
  // ----------------------------------------------
  // (4) Delete a post by post id
  //only original post creator whould allowed to delete the post
  app.delete("/campus-connect/posts/:postid",authenticateJWT, authorizeRole([1,2]), async (request, response) => {
    const postid = request.params.postid;

    //If user is not an admin then check to see if they created the post
    if(request.user.role == 1){
      //retrieve the post info to check who created the post
      url = `http://localhost:3000/campus-connect/posts/${postid}`
      let postResponse = await fetch(url, {
          method:'GET'
      })

      //retreive user id for creator
      let postResponceData = await postResponse.json()
      let post = postResponceData[0]
      let creatorId = post["UserID"]

      //check to see if userid matches to logged in user
      if(creatorId != request.user.userId){
        return response
          .status(401)
          .json({ Error: "Unathorized: invalid user" });
      }
    }
    
    //proceed with deletion
>>>>>>> b11e81e8824163f8eb7be9909e41863075fcd2f2
    const sqlQuery = "DELETE FROM posts WHERE postid = ? ; ";
    dbConnection.query(sqlQuery, postid, (err, result) => {
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