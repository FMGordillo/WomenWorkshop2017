'use strict';

// security.js
var secure     = require('express-secure-only'),
  helmet       = require('helmet');

module.exports = function (app) {
  app.enable('trust proxy');

  // 1. redirects http to https
  app.use(secure());

  // 2. helmet with defaults
  app.use(helmet());
};
