/*All of this 'require' stuff is looking for files in node_modules, or if it begins with './' it checks the current working directory.
Dependencies are listed in package.json. Some modules, such as http, are built into node*/
var logger = require('morgan'),
    cors = require('cors'),
    http = require('http'),
    express = require('express'),
    app = express(),
    server = http.Server(app),
    errorhandler = require('errorhandler'),
    dotenv = require('dotenv'),
    bodyParser = require('body-parser'),
    io = require('socket.io')(server);

dotenv.load();

/*bodyParser lets us see the request params as json*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(function(err, req, res, next) {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    next(err);
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(express.logger('dev'));
  app.use(errorhandler());
}

/*Load user-routes.js and announcement-routes.js and add them to the express url mapping*/
app.use(require('./user-routes'));
app.use(require('./announcement-routes'));
app.use(require('./upload-routes'));
/*Load socket-config.js which sets up Socket.io chat functionality*/
require('./socket-config')(io);

/*Set the http headers to allow cross origin resource sharing (CORS) and specific http methods*/
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

/*Tells the server to listen on port 3001, so all of the server routes are localhost:3001/yada/yada*/
server.listen(3001);
console.log('listening on port 3001');

