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


//link to postsservice
const postsservice = require("./postsservice");
app.use(postsservice);


//link to userservice
const userservice = require("./userservice");
app.use(userservice);

//link to replyservice
const replyservice = require("./replyservice");
app.use(replyservice);


//link to likedislikeservice
const likedislikeservice = require("./likedislikeservice");
app.use(likedislikeservice);

//link to moderationservice
const moderationservice = require("./moderationservice");
app.use(moderationservice);

//link to searchservice
const searchservice = require("./searchservice");
app.use(searchservice);

//link to subforumservice
const subforumservice = require("./subforumservice");
app.use(subforumservice);

//link to subservice
const subservice = require("./subservice");
app.use(subservice);



// ----------------------------------------------
// Ref: https://expressjs.com/en/4x/api.html#app
// (C)  Create a server such that it binds and
//      listens on a specified host and port.
//      We will use default host and port 3000.
app.listen(3000, () => {
  console.log("Express server is running and listening");
});
