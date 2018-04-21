var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
// var express = require("express");

var app = express();

var router = express.Router();


//var db = require("../models");
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

    var entry = new Article(results)
//     entry.save(function(err, doc) {
//   // Log any errors
//   if (err) {
//     console.log(err);
//   }
//   // Or log the doc
//   else {
//     console.log(doc);
//   }
// });
   
    
  });
  res.send(results);
});
  
});

// Retrieve data from the db
router.get("/all", function(req, res) {
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

// Default route renders the index handlebars view
router.get('/', function(req, res){
  Article
    .find({})
    .exec(function(err,data) {
      //console.log(data)
      if (err) return console.error(err);
      // If successful render first data
      
        
      res.render('index', { 
        title: data.title,
        summary: data.summary,
        _id: data._id,
        link: data.link,
        comments: data.comments
      });
        
      
    
      
    })
})

module.exports = router;