var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt'),
  Users = require('./models.js').Users;

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

/*Creates the token sent to the client. Encrypts it with a string 'secret' which is stored in config.json.
The client saves this token and then sends it with every request so the server can identify them*/
function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, {
    expiresInMinutes: 60 * 5
  });
}

/*Builds the query for the 'advanced' search. Only adds properties to the returned 'query' object if they
exist in the search params. So if someone only fills out NetID in the search field, only NetID is added to the mongo query*/
function buildQuery(params) {
  var query = {};
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      var val = params[key];
      if (val) {
        query[key] = {
          '$regex': val,
          '$options': 'i'
        };
      }
    }
  }
  return query;
}

function scrubUsers(user) {
  return _.pick(user, 'name', 'dormName', 'dormRoom', 'netId', 'gradClass', 'major', 'phone', 'groups', 'email');
}

/*Every time a request is made to /user/auth/something make sure a valid token is attached*/
app.use('/user/auth', jwtCheck);

/*The endpoint to create a new user. Checks that they have netId and password, and that the user doesn't already exist.
If everything checks out the server returns a token for the client to hold onto*/
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

  var profile = _.pick(req.body, 'name', 'dormName', 'dormRoom', 'netId', 'gradClass', 'major', 'phone', 'email', 'groups', 'password');
  profile.groups = profile.groups.split(',');

  Users.create(profile, function(err) {
    if (err) {
      res.send(err);
    }
  });

  res.status(201).send({
    id_token: createToken(profile)
  });
});

/*The login endpoint. Finds the user from the database and returns a token*/
app.post('/user/createSession', function(req, res) {
  if (!req.body.netId || !req.body.password) {
    return res.status(400).send("You must send the netId and the password");
  }

  Users.findOne({
    'netId': req.body.netId
  }, function(err, user) {

    if (!user) {
      return res.status(401).send("The netId or password don't match");
    }

    if (user.password !== req.body.password) {
      return res.status(401).send("The netId or password don't match");
    }

    res.status(201).send({
      id_token: createToken(user)
    });

  });

});

/*will be removed*/
app.get('/user/auth/test/allUsers', function(req, res) {
  Users.find(function(err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
});

/*will be removed*/
app.delete('/user/auth/test/allUsers', function(req, res) {
  Users.remove({}, function(err, users) {
    if (err) {
      res.send(err);
    }
    Users.find(function(err, users) {
      if (err) {
        res.send(err);
      }
      res.json(users);
    });
  });
});

/*Find all users by name*/
app.get('/user/auth/findAll', function(req, res) {
  var name = req.query.name;

  Users.find({
    'name': {
      '$regex': name,
      '$options': 'i'
    }
  }, function(err, users) {
    var results = _.map(users, scrubUsers);
    res.send({
      users: results
    });
  });
});

/*Find single user by netId*/
app.get('/user/auth/findOne', function(req, res) {
  var netId = req.query.netId;

  Users.findOne({
    'netId': {
      '$regex': netId,
      '$options': 'i'
    }
  }, function(err, user) {
    var result = scrubUsers(user);
    res.send({
      user: result
    });
  });
});

/*Advanced search. Grabs all of the request parameters and passes them to the buildQuery function,
then runs that query and returns the result*/
app.get('/user/auth/findAllAdvanced', function(req, res) {
  var reqParams = {
      name: req.query.name,
      dormName: req.query.dormName,
      netId: req.query.netId,
      major: req.query.major,
      groups: req.query.groups,
      email: req.query.email
    },
    query = buildQuery(reqParams);

  Users.find(query, function(err, users) {
    res.send({
      users: users
    });
  });
});
