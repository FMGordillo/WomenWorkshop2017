var express = require('express'),
  app = express()
  Cloudant  = require("cloudant"),
  cfenv = require('./cfenv-wrapper');
require("./config/express")(app);
require('dotenv').load();
var appEnv = cfenv.getAppEnv();

console.log(process.argv.join(" "));

// DON'T MODIFY all above **********************************************

app.set("testDb", true);

// DON'T MODIFY all below **********************************************

var usernameDb="",
  passwordDb="",
  dbname="women-2017",
  d = new Date(),
  date =  d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

if(process.env.VCAP_SERVICES) {
  usernameDb=appEnv.getServiceCreds('TuTalentoOculto-cloudantNoSQLDB').username;
  usernameAPIDb=appEnv.getEnvVar('Db_APIKEY');
  passwordAPIDb=appEnv.getEnvVar('Db_APIPW');
} else {
  usernameDb= process.env.CLOUDANT_USERNAME;
  usernameAPIDb=process.env.CLOUDANT_APIKEY;
  passwordAPIDb= process.env.CLOUDANT_APIPW;
}

var cloudant = Cloudant({
    account: usernameDb,
    key: usernameAPIDb,
    password: passwordAPIDb
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

app.post("/response", function(req, res, next) {
  var name = req.body.inputName,
  email = req.body.inputEmail,
  orgOpt = req.body.optionsRadios,
  orgTxt = req.body.inputOrg,
  explain = req.body.inputExplain;

  app.womendb.insert(
    {
      'name': name,
      'email': email,
      'orgOption': orgOpt,
      'orgText': orgTxt,
      'explaination': explain,
      'date': date

    }, function(errDb,bodyDb,headerDb) {
      if(errDb) {
        console.log("Error creating document - ", errDb.message);
        return;
      }
      console.log("all records inserted.")
      console.log(bodyDb);
    });

  res.render("response", {
    title: "¡Muchas gracias!",
    name: name,
    email: email,
    orgOpt: orgOpt,
    orgTxt: orgTxt,
    explain: explain
  });
});

require("./config/error-handler")(app);
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
