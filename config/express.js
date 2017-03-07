'use strict';

// Module dependencies
var express    = require('express'),
  bodyParser   = require('body-parser'),
  serveIndex   = require('serve-index'),
  cookieParser = require('cookie-parser'),
  // expressSession = require('express-session'),
  morgan = require('morgan');

module.exports = (app) => {
  app.set("view engine", "ejs");
  // require('ejs').delimiter = '$';
  app.enable('trust proxy');
  app.use(morgan('dev'));
  // app.engine("html", require("ejs").renderFile);
  // app.set('views', __dirname + '/../views');

  app.use(cookieParser());
  // app.use(expressSession({
  //   secret: 'demo-' + Math.floor(Math.random() * 2000),
  //   resave: true,
  //   saveUninitialized: true
  // }));

  // Configure Express
  app.use(bodyParser.urlencoded({limit: '15mb', extended: true }));
  app.use(bodyParser.json({limit: '15mb'}));
  app.use(express.static(__dirname + '/../public'));

  require('./i18n')(app);

  if (process.env.VCAP_APPLICATION) {
    require('./security')(app);
  }
  // require('./passport')(app);
};
