// ----------------------------------------------
// TCSS 460: Autumn 2023
// Author: Alex Garcia 
// Backend REST Service Module
// Post Service
// ----------------------------------------------
// retrieve necessary files (express and cors)
const express = require("express");
const cors = require("cors");
// retrieve the MySQL DB Configuration Module
const dbConnection = require("./config");
// use this library for parsing HTTP body requests
var bodyParser = require("body-parser");

require('dotenv').config();
// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);

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
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: post was not added." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: post was added!", postId: result.insertId });
    });
  });
  
  
  // ----------------------------------------------
  // (1) retrive the information for a specific post
  // root URI: http://localhost:port/campus-connect/posts/:postid
  // no auth required
  app.get("/campus-connect/posts/:postid", (request, response) => {
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