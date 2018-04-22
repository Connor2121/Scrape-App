var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
// var express = require("express");

var app = express();

var router = express.Router();

mongoose.Promise = Promise;

// Mongodb models
  var Article = require("../models/article");


// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function(req, res) {

  request("https://stabmag.com/", function(error, response, html) {
  var $ = cheerio.load(html);
  var results = [];
  $("div.grid-layout").each(function(i, element) {

    var link = $(this).children('div.grid-item').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('h2.feed-title').children('a').attr('href');
    var summary = $(this).children('div.grid-item').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('p').text();
    var title = $(this).children('div.grid-item').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('h2.feed-title').children('a').text();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      summary: summary,
      link: link
    });
    // Check database to see if story saved previously to database
			Article.findOne({title: title}, function(err, articleRecord) {
				if(err) {
					console.log(err);
				} else {
					if(articleRecord == results.title) {
						Article.create(results, function(err, record) {
							if(err) throw err;
              console.log("Record Added");
              console.log(record);
						});
					} else {
						console.log("No Record Added");
					}					
				}
			});	
  });
  res.send(results);
});
  
});

// Retrieve data from the db
router.get("/articles", function(req, res) {
  // Find all results from the scrapedData collection in the db
  Article.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});


router.get("/", function(req, res) {
  Article.find({}, function(error, data) {
    res.render("index", {news: data});
  });
});

module.exports = router;