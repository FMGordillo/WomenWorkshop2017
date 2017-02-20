'use strict';

module.exports = function (app) {

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.code = 404;
    err.message = 'Not Found';
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    var error = {
      code: err.code || 500,
      error: err.error || err.message
    };
    if (err.url)
      error.url = err.url;

    console.log('error:', error, 'url:', req.url);
    res.status(error.code).render('error', error);
  });

};
