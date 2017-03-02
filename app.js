require('dotenv').load();
var express = require('express'),
    app = express()
    Cloudant  = require("cloudant"),
    cfenv = require('./cfenv-wrapper'),
    helper = require('sendgrid').mail,
    sg = require('sendgrid')(process.env.SENDGRID_API_KEY),
    session = require('express-session'),
    cookieParser = require('cookie-parser');
require("./config/express")(app);
var appEnv = cfenv.getAppEnv();

app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));

console.log(process.argv.join(" "));

// *****************************************************************************
// DON'T MODIFY all above ******************************************************
// *****************************************************************************

var from_email = new helper.Email('test@example.com'),
    subject = '[#WomenWorkshop TEST] CORREO DE PRUEBA',
    content = new helper.Content('text/plain', 'MAIL DE PRUEBA NO VÁLIDO PARA PRODUCCIÓN');

app.set("testDb", true);

// *****************************************************************************
// DON'T MODIFY all below ******************************************************
// *****************************************************************************

var usernameDb="",
  passwordDb="",
  userAceptado="",
  dbname="women-2017",
  d = new Date(),
  date =  d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

if(process.env.VCAP_SERVICES) {
  usernameDb=appEnv.getServiceCreds('TuTalentoOculto-cloudantNoSQLDB').username;
  usernameAPIDb=appEnv.getEnvVar('Db_APIKEY');
  passwordAPIDb=appEnv.getEnvVar('Db_APIPW');
  userAceptado=appEnv.getEnvVar('USER_ADMIN');
} else {
  usernameDb= process.env.CLOUDANT_USERNAME;
  usernameAPIDb=process.env.CLOUDANT_APIKEY;
  passwordAPIDb= process.env.CLOUDANT_APIPW;
  userAceptado= process.env.USER_ADMIN;
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

app.get("/loginStats", function(req,res) {
  res.render("loginStats")
})

app.post("/statsPage", function(req, res) {
  console.log(req.body.Username);
  if (req.body.Username != userAceptado) {
    res.redirect('/loginStats');
  } else {
    res.render("statsPage");
  }
})

app.get("/personalidad", function(req, res) {
  var id = req.query.id;

  res.render("personalidad"), {
    title: "Personalidad TEST"
  }
})

app.post("/response", function(req, res, next) {
  var name = req.body.inputName,
  email = req.body.inputEmail,
  orgTxt = req.body.inputOrg,
  explain = req.body.inputExplain;

  // MAIL HELPER
  var to_email = new helper.Email(email),
      mail = new helper.Mail(from_email, subject, to_email, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  app.womendb.insert(
    {
      'name': name,
      'email': email,
      'validado': false,
      'orgText': orgTxt,
      'explaination': explain,
      'date': date,

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
      if(error) {
        console.log(error);
        console.log('FIN ERROR')
      } else {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        console.log('FIN EXITO')
      }
    });

  res.render("response", {
    title: "¡Muchas gracias!",
    name: name,
    email: email,
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
