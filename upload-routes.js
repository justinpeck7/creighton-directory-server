var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt');

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

/*Every time a request is made to /picture/auth/something make sure a valid token is attached*/
app.use('/picture/auth', jwtCheck);

