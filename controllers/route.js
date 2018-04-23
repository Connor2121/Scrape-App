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
var Article = require("../models/article.js");
var Comment = require('../models/comment.js');


router.get("/", function (req, res) {
  res.redirect("/articles");
});

// Retrieve data from the db
router.get("/articles", function (req, res) {
  // Find all results from the scrapedData collection in the db
  Article.find({}, function (error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render('index', { news: found });
    }
  })
    .sort({ '_id': -1 })
});

// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function (req, res) {

  request("https://stabmag.com/", function (error, response, html) {
    var $ = cheerio.load(html);

    $('div.grid-layout').each(function (i, element) {

      var link = $(this).children('div.stab-post-block__container').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('h2.feed-title').children('a').attr('href');
      var summary = $(this).children('div.stab-post-block__container').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('p').text();
      var title = $(this).children('div.stab-post-block__container').children('div.stab-post-block').children('div.stab-post-block__primary-info').children('h2.feed-title').children('a').text();

      // Save these results in an object that we'll push into the results array we defined earlier
      var results = {};

      results.title = title;
      results.summary = summary;
      results.link = link;

      // Check database to see if article is repeat-- runs as many times as articles
			Article.findOne({'title': title}, function(err, article) {
				if(err) {
					console.log(err);
				} else {
          //if title is not found then create
					if(article === null) {
						Article.create(results, function(err, record) {
							if(err) throw err;
							console.log("Articles Added");
						});
					} else {
            console.log("No New Articles");
					}					
				}
			});	
    });
    res.redirect('/');
  });
});

// Grab an article by it's ObjectId
router.get("/articles/:id", function (req, res) {
  // Using the id passed find the correct document in the collection
  Article.findOne({_id: req.params.id})
  //  populate all of the Comments associated with it
    .populate("Comments")
    .then(function (article) {
      // Log any errors
        res.render("comments", {result: article});
       //res.json(article);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});

// Create a new comment
router.post("/articles/:id", function (req, res) {
  // Create a new Comment and pass the req.body to the entry
  Comment.create(req.body)
    .then(function(dbComment) {
      return Article.findOneAndUpdate({_id: req.params.id}, {comment: dbComment._id}, {new: true});
    })
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
      
module.exports = router;