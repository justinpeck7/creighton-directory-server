var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt'),
  Users = require('./users.js');

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, {
    expiresInMinutes: 60 * 5
  });
}

app.use('/user/auth', jwtCheck);

app.post('/user/createUser', function(req, res) {

  var existingUser;

  Users.findOne({
    'netId': req.body.netId
  }, function(err, user) {
    existingUser = user;
  });

  if (!req.body.netId || !req.body.password) {
    return res.status(400).send("You must send the netId and the password");
  }
  if (existingUser) {
    return res.status(400).send("A user with that netId already exists");
  }

  var profile = _.pick(req.body, 'name', 'dormName', 'dormRoom', 'netId', 'gradYear', 'major', 'phone', 'groups', 'password');

  profile.groups = profile.groups.replace(/\s/g, '').split(',');

  Users.create(profile, function(err) {
    if (err) {
      res.send(err);
    }
  });

  res.status(201).send({
    id_token: createToken(profile)
  });
});

app.post('/user/createSession', function(req, res) {
  if (!req.body.netId || !req.body.password) {
    return res.status(400).send("You must send the netId and the password");
  }

  Users.findOne({'netId': req.body.netId}, function(err, user) {

    if (!user) {
      return res.status(401).send("The netId or password don't match");
    }

    if (!user.password === req.body.password) {
      return res.status(401).send("The netId or password don't match");
    }

    res.status(201).send({
      id_token: createToken(user)
    });

  });

});

app.get('/user/auth/allUsers', function(req, res) {
  Users.find(function(err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
});

app.delete('/user/auth/allUsers', function(req, res) {
  Users.remove({}, function(err, users) {
    if (err) {
      res.send(err);
    }
    Users.find(function(err, users) {
      if (err) {
        res.send(err);
      }
      res.json(users);
    })
  });
});
