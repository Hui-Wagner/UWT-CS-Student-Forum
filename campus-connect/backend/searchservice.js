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



//WEBSERVICE : Search service
// ----------------------------------------------
// (1) create a search service that searches through posts
// URI: http://localhost:port/search
app.get("http://localhost:port/search", (request, response) => {
    const searchTerm = request.query.term;
    const sqlQuery = `
        SELECT * 
        FROM Posts 
        WHERE Title LIKE '%${searchTerm}%' OR Content LIKE '%${searchTerm}%';
    `;
    
    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            return response
                .status(400)
                .json({ Error: "Error in the SQL statement. Please check." });
        }
        
        response.setHeader("searchTerm", searchTerm);
        return response.status(200).json(result);
    });
});









module.exports=app;