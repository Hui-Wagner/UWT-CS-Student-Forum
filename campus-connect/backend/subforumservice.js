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

app.get("/forums/:SubForumID", (req, res) => {
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
        // Even if there is an error updating the view count, the post list is still sent to the client
      });
  
      // Send the post list with a 200 status code (OK)
      return res.status(200).json(results);
    });
  });

// // ----------------------------------------------
// // (3) Get: Get the content of a post and all its responses
// // **** This is used to show on the one particular post page ****
// // URI: http://localhost:port/posts/:PostID
// // ----------------------------------------------

// app.get("/posts/:PostID", (req, res) => {
//     console.log("Fetching post with ID:", req.params.PostID);
  
//     const postQuery = "SELECT * FROM Posts WHERE PostID = ?";
//     dbConnection.query(postQuery, [req.params.PostID], (postErr, postResults) => {
//       if (postErr) {
//         console.error("Error fetching post:", postErr);
//         return res.status(500).json({ Error: "Failed to fetch the post." });
//       }
//       if (postResults.length === 0) {
//         return res.status(404).json({ Error: "Post not found." });
//       }
  
//       // If the post is found, proceed to fetch responses
//       fetchResponses(req.params.PostID, postResults[0], res);
//     });
//   });
  
//   function fetchResponses(postID, post, res) {
//     const responsesQuery = "SELECT * FROM Responses WHERE PostID = ? ORDER BY ResponceDate"; // Make sure the column name is correct
//     dbConnection.query(responsesQuery, [postID], (responseErr, responseResults) => {
//       if (responseErr) {
//         console.error("Error fetching responses:", responseErr);
//         // Send back the post with an empty array for responses
//         responseResults = [];
//       }
  
//       res.status(200).json({
//         Post: post,
//         Responses: responseResults
//       });
//     });
//   }
  
  

module.exports = app;