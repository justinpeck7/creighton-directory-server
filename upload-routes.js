var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt'),
  multer = require('multer'),
  Images = require('./models.js').Images,
  Users = require('./models.js').Users;

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

/*Make sure users who upload pictures are authenticated*/
app.use('/upload', jwtCheck);

/*Handles the actual saving of images to the /uploads/images folder*/
var uploader = multer({
  dest: './uploads/images',
  limits: {
    fileSize: 1000000,
    files: 1
  }
});

function updateProfilePicture(netId, file, callback) {
  var imgData = {
    netId: netId,
    image: file.filename,
    contentType: file.mimetype
  };
  Images.findOne({
    netId: netId
  }, function(err, image) {
    if (image) {
      image.image = file.filename;
      image.contentType = file.mimetype;
      image.save(function(err, image) {
        callback();
      });
    } else {
      Images.create(imgData, function(err) {
        if (err) {
          res.send(err);
        }
        callback();
      });
    }
  });
}

function updateProfileData(netId, userData, callback) {
  if (userData.groups) {
    userData.groups = userData.groups.split(',');
  }
  Users.findOne({
    netId: netId
  }, function(err, user) {
    if (err) {
      res.send(err);
    }
    for (var prop in userData) {
      user[prop] = userData[prop];
    }
    user.save(function(err, user) {
      callback();
    });
  });
}

/*Receive post request with image/profile data attached. If the user already has a profile picture,
update their info and save the image. Otherwise create a new document in the database
and save the image. Update Users document with any new info.*/
app.post('/upload/auth/profile', uploader.single('picture'), function(req, res) {
  var file = req.file,
    userData = JSON.parse(req.body.userData);

  if (file && userData) {
    updateProfilePicture(req.body.netId, file, function() {
      updateProfileData(req.body.netId, userData, function() {
        res.status(201).send('Updated!');
      });
    });
  } else if (file && !userData) {
    updateProfilePicture(req.body.netId, file, function() {
      res.status(201).send('Updated!');
    });
  } else if (!file && userData) {
    updateProfileData(req.body.netId, userData, function() {
      res.status(201).send('Updated!');
    });
  }
  else {
    res.status(201).send('Nothing to update');
  }
});

/*Get the profile picture for a given netId. If no picture exists send the default image*/
app.get('/profile/image', function(req, res) {

  var netId = req.query.netId;
  Images.findOne({
    netId: netId
  }, function(err, image) {
    if (image) {
      var contentType = image.contentType,
        imageName = image.image;
      res.header('Content-Type', contentType);
      res.sendFile(__dirname + '/uploads/images/' + imageName);
    } else {
      res.header('Content-Type', 'image/jpeg');
      res.sendFile(__dirname + '/uploads/images/default.jpg');
    }
  });
});
