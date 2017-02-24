require('dotenv').load();
var express = require('express'),
    app = express()
    Cloudant  = require("cloudant"),
    cfenv = require('./cfenv-wrapper'),
    helper = require('sendgrid').mail,
    sg = require('sendgrid')(process.env.SENDGRID_API_KEY);;
require("./config/express")(app);
var appEnv = cfenv.getAppEnv();

console.log(process.argv.join(" "));

// DON'T MODIFY all above **********************************************

var from_email = new helper.Email('test@example.com'),
    to_email = new helper.Email('golanlf@ar.ibm.com'),
    subject = 'Hello World from the SendGrid Node.js Library!',
    content = new helper.Content('text/plain', 'Hello, Email!'),
    mail = new helper.Mail(from_email, subject, to_email, content);

app.set("testDb", true);

// DON'T MODIFY all below **********************************************

// MAIL HELPER
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});

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
    title: "Women Workshop"
  });
});

app.get("/personalidad", function(req, res) {
  res.render("personalidad"), {
    title: "Personalidad TEST"
  }
})

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

    // MAIL SENDED
    sg.API(request, function(error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
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
