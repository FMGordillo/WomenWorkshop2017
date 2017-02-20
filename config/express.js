'use strict';

// Module dependencies
var express    = require('express'),
  bodyParser   = require('body-parser'),
  serveIndex   = require('serve-index');

module.exports = function (app) {
  // Only loaded when SECURE_EXPRESS is `true`
  if (process.env.SECURE_EXPRESS)
    require('./security')(app);

  // Configure Express
  app.use(bodyParser.urlencoded({limit: '4mb', extended: true }));
  app.use(bodyParser.json({limit: '4mb'}));

  // Setup static public directory
  app.use(express.static(__dirname + '/../public'));
  // app.use('/samples', serveIndex(__dirname + '/../samples'));
  // app.use('/samples', express.static(__dirname + '/../samples'));

  app.set("view engine", "html");
  app.engine("html", require("ejs").renderFile);
  app.set('views', __dirname + '/../views');
};
