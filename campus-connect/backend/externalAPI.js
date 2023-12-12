// retrieve necessary files (express, cors, and https)
const express = require("express");
const cors = require("cors");
const https = require("https"); // 引入https模块

// retrieve the MySQL DB Configuration Module
const dbConnection = require("./config");
// use this library for parsing HTTP body requests
var bodyParser = require("body-parser");
const { time } = require("console");

var app = express(express.json);

app.use(cors());
app.use(bodyParser.json());

// ----------------------------------------------
// (1)GET: External News API
// API From: https://newsapi.org
// URI: http://localhost:port/news
// ----------------------------------------------
const apiKey = "66cec1b12aef44fab04890b9d4f155b2";
const apiUrl = "https://newsapi.org/v2/everything";

app.get("/news", (request, response) => {
  // Get the query parameter from the request
  const query = request.query.q || 'Computer Science'; // If no query parameter is provided, default to 'ComputerScience'

  // Set up the options for the HTTPS request to the News API
  const options = {
    hostname: 'newsapi.org',
    path: `/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&apiKey=${apiKey}`,
    method: 'GET',
    headers: {
      'User-Agent': 'MyServer/1.0', // Set our own User-Agent
    }
  };

  // Use the https library to make a GET request to the News API
  const req = https.request(options, (res) => {
    let data = '';

    // Receive data in chunks
    res.on('data', (chunk) => {
      data += chunk;
    });

    // Data reception is done, do something with it
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        response.json(json);
      } catch (error) {
        response.status(500).json({ message: "Error parsing news data" });
      }
    });
  });

  req.on('error', (error) => {
    response.status(500).json({ message: "Error fetching news" });
  });

  // End the request
  req.end();
});

// ----------------------------------------------
// (2)POST: Linkedin Jobs Scraper API
// API From: https://rapidapi.com/bebity-bebity-default/api/linkedin-jobs-scraper-api
// URI: http://localhost:port/jobs
// ----------------------------------------------

// Constants for the LinkedIn Jobs Scraper API
const rapidApiHost = 'linkedin-jobs-scraper-api.p.rapidapi.com';
const rapidApiKey = '317cec9d3cmsh30b4bde624cace8p18ca4cjsn9357bcc8d9ce'; 

app.post("/jobs", (request, response) => {
    // Extract data from the request body, or set default values
    const { title, location, rows } = request.body;
  
    const postData = JSON.stringify({
      title: title || 'Software Engineer',
      location: location || 'Washington',
      rows: rows || 10
    });
  
    // Set up the options for the HTTPS request to the LinkedIn Jobs Scraper API
    const options = {
      hostname: rapidApiHost,
      path: '/jobs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
        // 'Content-Length': Buffer.byteLength(postData)
      }
    };
  
    // Make the HTTPS request to the LinkedIn Jobs Scraper API
    const req = https.request(options, (res) => {
      let data = '';
  
      // Receive data in chunks
      res.on('data', (chunk) => {
        data += chunk;
      });
  
      // Data reception is done, process the data
      res.on('end', () => {
        try {
          // Parse the JSON data and send it in the response
          const json = JSON.parse(data);
          response.json(json);
        } catch (error) {
          // Handle JSON parsing error
          response.status(500).json({ message: "Error parsing jobs data" });
        }
      });
    });
  
    req.on('error', (error) => {
      // Handle request error
      response.status(500).json({ message: "Error fetching jobs" });
    });
  
    // Write the data to the request body
    req.write(postData);
  
    // End the request
    req.end();
  });
  


module.exports = app;