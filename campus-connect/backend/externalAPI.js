// retrieve necessary files (express, cors, and https)
const express = require("express");
const cors = require("cors");
const https = require("https"); 

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

/**
 * @swagger
 * /news:
 *   get:
 *     tags: [External API 1: News]
 *     summary: Retrieve news articles
 *     description: Fetch a list of news articles based on the query parameter.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         description: Query term to search for
 *         type: string
 *     responses:
 *       '200':
 *         description: A list of news articles.
 *         content:
 *           application/json:
 *             example:
 *               status: "ok"
 *               totalResults: 38
 *               articles: [
 *                    {
 *      "source": {
 *        "id": "engadget",
 *        "name": "Engadget"
 *      },
 *      "author": "Andrew Tarantola",
 *      "title": "Offworld 'company towns' are the wrong way to settle the solar system",
 *      "description": "Company Towns — wherein a single firm provides most or all necessary services, from housing and employment to commerce and amenities to a given community — have dotted America since before the Civil War. As we near the end of the first quarter of the 21st cen…",
 *      "url": "https://www.engadget.com/hitting-the-books-a-city-on-mars-kelly-and-zach-weinersmith-penguin-153023805.html",
 *      "urlToImage": "https://s.yimg.com/ny/api/res/1.2/lUm39QNAgsrxDA.0OxasPw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://s.yimg.com/os/creatr-uploaded-images/2023-11/e69902d0-92d9-11ee-ae2d-ea47191386db",
 *       "publishedAt": "2023-12-10T15:30:23Z",
 *      "content": "Company Towns wherein a single firm provides most or all necessary services, from housing and employment to commerce and amenities to a given community have dotted America since before the Civil War.… [+12540 chars]"
 *    },]
 *       '500':
 *         description: Error fetching news data.
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     tags: [External API 2: Linkedin Jobs Scraper API]
 *     summary: Retrieve job listings
 *     description: Fetch a list of job listings based on the provided body content.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               rows:
 *                 type: integer
 *             example:
 *               title: "Software Engineer"
 *               location: "Washington"
 *               rows: 10
 *     responses:
 *       '200':
 *         description: A list of job listings.
 *         content:
 *           application/json:
 *             example:
 *               jobs: [  {
 *   "id": "3761317746",
 *   "publishedAt": "2023-11-30",
 *   "salary": "$116,002.00-$137,000.00",
 *   "title": "Software Engineer (University Grad)",
 *   "jobUrl": "https://www.linkedin.com/jobs/view/software-engineer-university-grad-at-meta-3761317746?trk=public_jobs_topcard-title",
 *   "companyName": "Meta",
 *   "companyUrl": "https://www.linkedin.com/company/meta?trk=public_jobs_topcard-org-name",
 *   "location": "Washington, DC",
 *   "postedTime": "1 week ago",
 *   "applicationsCount": "Over 200 applicants",
 *   "description": "Want to build new features and improve existing products that more than a billion people around the world use? Are you interested in working on highly impactful technical challenges to help the world be more open and connected? Want to solve unique, large-scale, highly complex technical problems? Our development cycle is extremely fast, and we've built tools to keep it that way. It's common to write code and have it running live on the site just hours later. We push code to the site continuously and have small teams that build products that are touched by millions of people around the world. If you work for us, you will be able to make an impact immediately.Facebook is seeking Software Engineers to join our engineering team. You can help build the next-generation of systems behind Facebook's products, create web applications that reach millions of people, build high volume servers and be a part of a team that’s working to help people connect with each other around the globe.This position is full-time and there are minimal travel requirements.\n\nSoftware Engineer (University Grad) Responsibilities:\n\n\n * Develop a strong understanding of relevant product area, codebase, and/or systems\n * Demonstrate proficiency in data analysis, programming and software engineering\n * Produce high quality code with good test coverage, using modern abstractions and frameworks\n * Work independently, use available resources to get unblocked, and complete tasks on-schedule by exercising strong judgement and problem solving skills\n * Master Facebook’s development standards from developing to releasing code in order to take on tasks and projects with increasing levels of complexity\n * Actively seek and give feedback in alignment with Facebook’s Performance Philosophy\n   \n   \n\nMinimum Qualifications:\n\n\n * Currently has, or is in the process of obtaining a Bachelor's degree in Computer Science, Computer Engineering, relevant technical field, or equivalent practical experience. Degree must be completed prior to joining Meta.\n * Experience coding in an industry-standard language (e.g. Java, Python, C++, JavaScript)\n * Must obtain work authorization in country of employment at the time of hire, and maintain ongoing work authorization during employment\n   \n   \n\nPreferred Qualifications:\n\n\n * Demonstrated software engineering experience from previous internship, work experience, coding competitions, or publications\n * Currently has, or is in the process of obtaining, a Bachelors or Masters degree in Computer Science or a related field\n   \n   \n\nAbout Meta:\n\nMeta builds technologies that help people connect, find communities, and grow businesses. When Facebook launched in 2004, it changed the way people connect. Apps like Messenger, Instagram and WhatsApp further empowered billions around the world. Now, Meta is moving beyond 2D screens toward immersive experiences like augmented and virtual reality to help build the next evolution in social technology. People who choose to build their careers by building with us at Meta help shape a future that will take us beyond what digital connection makes possible today—beyond the constraints of screens, the limits of distance, and even the rules of physics.\n\nMeta is proud to be an Equal Employment Opportunity and Affirmative Action employer. We do not discriminate based upon race, religion, color, national origin, sex (including pregnancy, childbirth, or related medical conditions), sexual orientation, gender, gender identity, gender expression, transgender status, sexual stereotypes, age, status as a protected veteran, status as an individual with a disability, or other applicable legally protected characteristics. We also consider qualified applicants with criminal histories, consistent with applicable federal, state and local law. Meta participates in the E-Verify program in certain locations, as required by law. Please note that Meta may leverage artificial intelligence and machine learning technologies in connection with applications for employment.\n\nMeta is committed to providing reasonable accommodations for candidates with disabilities in our recruiting process. If you need any assistance or accommodations due to a disability, please let us know at accommodations-ext@fb.com.",
 *   "contractType": "Full-time",
 *   "experienceLevel": "Not Applicable",
 *   "workType": "Engineering and Information Technology",
 *   "sector": "Technology, Information and Internet",
 *   "companyId": "10667",
 *   "posterProfileUrl": "",
 *   "posterFullName": ""
 * },]
 *       '500':
 *         description: Error fetching jobs data
 */

module.exports = app;