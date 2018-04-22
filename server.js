var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var Promise = require("bluebird");


var PORT = process.env.PORT || 3000;
var app = express();
app.use(express.static(__dirname + '/public'));

// If deployed, use the deployed database. Otherwise use the local mongoNews database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNews";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB

 mongoose.connect(MONGODB_URI);

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

router = require('./controllers/route.js');
app.use( '/',router);

// Use express.static to serve the public folder as a static directory
//app.use(express.static("public"));




// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  
