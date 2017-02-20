var express = require('express'),
  cfenv = require('cfenv'),
  app = express()
  cloudant  = require("cloudant");
require("./config/express")(app);
require('dotenv').load();
var appEnv = cfenv.getAppEnv();

console.log(process.argv.join(" "));

// DON'T MODIFY all above **********************************************

app.set("testDb", true);

// DON'T MODIFY all below **********************************************

var usernameDb="",
  passwordDb="",
  dbname="Women-2017";

if(process.env.VCAP_SERVICES) {
  usernameDb=appEnv.getServiceCreds('TuTalentoOculto-cloudantNoSQLDB').username;
  passwordDb=appEnv.getServiceCreds('TuTalentoOculto-cloudantNoSQLDB').password;
} else {
  usernameDb= process.env.CLOUDANT_USERNAME;
  passwordDb= process.env.CLOUDANT_PW;
}

cloudant({
    account: usernameDb,
    password: passwordDb
  }, function(err, cloudant) {
  if (err)
    return console.log("Error connecting to Cloudant account %s: %s", err.message);
  if (app.get("testDb")) dbname += "_test";
  console.log("using db:", dbname);
   // We use this reference from now on
  app.womendb = cloudant.use(dbname);
});

app.get("/", function(req, res) {
  res.render("index", {
    title: "Women Workshop",
  });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
