var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
// var express = require("express");

var app = express();

var router = express.Router();



// Mongodb models
  var Article = require("../models/article");


// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function(req, res) {

  request("http://www.foxnews.com/us.html", function(error, response, html) {
  var $ = cheerio.load(html);
  var results = [];
  $("article.article").each(function(i, element) {

    var link = $(this).children('div.info').children('div.content').children('p.dek').children('a').attr('href');
    var summary = $(this).children('div.info').children('div.content').children('p.dek').children('a').text();
    var title = $(this).children('div.info').children('header.info-header').children('h.title').children('a').text();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      summary: summary,
      link: link
    });

    Article.create(results)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
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