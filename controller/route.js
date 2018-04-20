var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var db = require("../models");
// Mongodb models
// var Articles = require("../models/articles");

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {

  request("http://www.foxnews.com/us.html", function(error, response, html) {
  var $ = cheerio.load(html);
  var results = [];
  $("article.article").each(function(i, element) {

    var link = $(element).children('div.info').children('header.info-header').children('h.title').children('a').attr('href');
    var summary = $(element).children('div.info').children('div.content').children('p.dek').children('a').text();
    var title = $(element).children('div.info').children('header.info-header').children('h.title').children('a').text();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      summary: summary,
      link: link
    });
  });
  console.log(results);
  db.scrapedData.insert(results, {ordered: false});
});
  res.send('scrape complete');
});