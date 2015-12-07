var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt'),
  Announcements = require('./models.js').Announcements;

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

/*Every time a request is made to /announcements/auth/something make sure a valid token is attached*/
app.use('/announcements/auth', jwtCheck);

/*Get all announcements*/
app.get('/announcements/auth/all', function(req, res) {
  Announcements.find(function(err, results) {
    if (err) {
      res.send(err);
    }
    res.json(results);
  });
});

/*Endpoint to create a new announcement*/
app.post('/announcements/auth/new', function(req, res) {
  var announcement = {
    title: req.body.title,
    content: req.body.content
  };

  Announcements.create(announcement, function(err) {
    if (err) {
      res.send(err);
    }
  });

  res.status(201).send('added');

});
