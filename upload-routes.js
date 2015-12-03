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

/*Receive post request with image/profile data attached. If the user already has a profile picture,
update their info and save the image. Otherwise create a new document in the database
and save the image. Update Users document with any new info.*/
app.post('/upload/auth/profile', uploader.single('picture'), function(req, res) {
  var file = req.file,
    userData = JSON.parse(req.body.userData);

  if (file) {
    var imgData = {
      netId: req.body.netId,
      image: file.filename,
      contentType: file.mimetype
    };
    Images.findOne({
      netId: req.body.netId
    }, function(err, image) {
      if (image) {
        image.image = file.filename;
        image.contentType = file.mimetype;
        image.save();
      } else {
        Images.create(imgData, function(err) {
          if (err) {
            res.send(err);
          }
        });
      }
    });
  }

  if (userData) {
    if (userData.groups) {
      userData.groups = userData.groups.split(',');
    }
    Users.findOne({
      netId: req.body.netId
    }, function(err, user) {
      if (err) {
        res.send(err);
      }
      for (var prop in userData) {
        user[prop] = userData[prop];
      }
      user.save();
    });
  }
  res.status(201).send('Updated!');

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
