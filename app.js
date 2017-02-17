require('dotenv').load();
var express = require('express'),
  cfenv = require('cfenv'),
  app = express();
var appEnv = cfenv.getAppEnv();

// DON'T MODIFY all above **********************************************



// DON'T MODIFY all below **********************************************
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
