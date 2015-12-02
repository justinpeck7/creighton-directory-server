var express = require('express'),
  _ = require('lodash'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  ejwt = require('express-jwt'),
  multer = require('multer'),
  Images = require('./models.js').Images;

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secret
});

/*Handles the actual saving of images to the /uploads/images folder*/
var uploader = multer({
  dest: './uploads/images',
  limits: {fileSize: 1000000, files:1}
});

/*Receive post request with image attached. If the user already has a profile picture,
update their info and save the image. Otherwise create a new document in the database
and save the image*/
app.post('/upload/image', uploader.any(), function(req, res) {
    var file = req.files[0];

    var imgData = {
        netId: req.body.name,
        image: file.filename,
        contentType: file.mimetype
    };

    Images.findOne({netId: req.body.name}, function(err, image) {
        if(image) {
            image.image = file.filename;
            image.contentType = file.mimetype;
            image.save();
            res.status(201).send('Updated!');
        }
        else {
            Images.create(imgData, function(err) {
                if(err) {
                    res.send(err);
                }
            res.status(201).send('Saved!');
            });
        }
    });
});

app.get('/image', function(req, res) {
    Images.findOne({netId: 'jmp51608'}, function(err, image) {
        var contentType = image.contentType,
            imageName = image.image;
        res.header('Content-Type', contentType);
        res.sendFile(__dirname + '/uploads/images/' + imageName);
    });
});

