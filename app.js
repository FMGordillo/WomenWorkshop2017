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

app.get("/statsPage", function(req, res) {
  if (req.body.Username != userAceptado) {
    res.redirect('loginStats');
  } else {
      res.send("TODO OK");
    }
}); // -- end get /statsPage

app.post("/statsPage", function(req, res) {
  if (req.body.Username != userAceptado) {
    res.redirect('loginStats');
  } else {
    // Obteniendo todos los registros, sin filtro
    app.womendb.find({selector: {_id:{ "$gt": 0}}}, function(err, body) {
      if(err) {
        console.log(err);
        return;
      }
      res.render("statsPage", {
        results: body.docs
      });
    });
  }
}); // fin /statsPage

app.post("/statsOK", function(req, res) {

  var isValidado = true;

  var updateUsuario = {
    "_id": req.body.id,
    "_rev": req.body.rev,
    "name": req.body.name,
    "email": req.body.email,
    "validado": isValidado,
    "orgText": req.body.orgText,
    "explaination": req.body.explaination,
    "date": req.body.date
  }

  var nombre = req.body.name,
      email = req.body.email;

  function updateUser(is) {

  }

  app.womendb.insert(updateUsuario, function(err, body) {
    if(err){
      res.render("statsOK", {
        message:"Error al validar al usuario. La Base de Datos no esta funcionando!"
      });
      return;
    } else { // si todo salio bien... INTENTAMOS EL MAIL

      // MAIL HELPER
      var to_email = new helper.Email(email),
          mail = new helper.Mail(from_email, subject, to_email, content);

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });

      // MAIL SENDED
      sg.API(request, function(error, response) {
        if(error) {
          console.log(error);
          res.render("statsOK", {
            message: "Mail fallo. Intente nuevamente. Mas detalles: " + error
          });
        } else {
          res.render("statsOK", {
            message:"¡Usuario validado y mail enviado! Vuelva y siga validando"
          }) // -- fin Render
          console.log('FIN EXITO')
        }
      });
    }
  }); // -- fin DB Insert

}); // -- fin post /statsOK

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
