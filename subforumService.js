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
const router = express.Router();

// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);

// ----------------------------------------------
// WEBSERVICE #4: Subforum Management Service
// Methods: 
// POST: Create a new subforum
// GET: Retrieve subforum information
// PUT: Update subforum details
// DELETE: Delete a subforum
// ----------------------------------------------
// (1) create a new subforum
// Note: subforum id is auto incremented so there is no need to pass
// a value for the id attribute
// URI: http://localhost:port/subforums/:subforumname
// ----------------------------------------------
app.use(cors());
app.use(bodyParser.json());

// POST: Create a new discussion subforum
router.post("/subforums", (req, res) => {
    const { name, description } = req.body;
    const sqlInsert = "INSERT INTO SubForums (Name, Description) VALUES (?, ?)";
    dbConnection.query(sqlInsert, [name, description], (err, results) => {
        if (err) {
            console.error("Error adding subforum:", err);
            res.status(500).send("Error adding subforum");
        } else {
            res.status(201).json({ subForumID: results.insertId });
        }
    });
});

// GET: Retrieve topic details by ID
router.get("/subforums/:id", (req, res) => {
    const { id } = req.params;
    const sqlSelect = "SELECT * FROM SubForums WHERE SubForumID = ?";
    dbConnection.query(sqlSelect, [id], (err, results) => {
        if (err) {
            console.error("Error fetching subforum:", err);
            res.status(500).send("Error fetching subforum");
        } else {
            res.status(200).json(results);
        }
    });
});

// PATCH: Edit a topic by ID
router.patch("/subforums/:id", (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const sqlUpdate = "UPDATE SubForums SET Name = ?, Description = ? WHERE SubForumID = ?";
    dbConnection.query(sqlUpdate, [name, description, id], (err, results) => {
        if (err) {
            console.error("Error updating subforum:", err);
            res.status(500).send("Error updating subforum");
        } else {
            res.status(200).json({ message: "Subforum updated successfully" });
        }
    });
});

// DELETE: Remove a topic by ID
router.delete("/subforums/:id", (req, res) => {
    const { id } = req.params;
    const sqlDelete = "DELETE FROM SubForums WHERE SubForumID = ?";
    dbConnection.query(sqlDelete, [id], (err, results) => {
        if (err) {
            console.error("Error deleting subforum:", err);
            res.status(500).send("Error deleting subforum");
        } else {
            res.status(200).json({ message: "Subforum deleted successfully" });
        }
    });
});

module.exports = router;


// ----------------------------------------------
// Ref: https://expressjs.com/en/4x/api.html#app
// (C)  Create a server such that it binds and
//      listens on a specified host and port.
//      We will use default host and port 3000.
app.listen(3001, () => {
  console.log("Express server is running and listening");
});
