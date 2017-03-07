/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// const passport = require('passport'),
      // twitterHelper = require('./helpers/twitter-helper'),
const mailHelper = require('./helpers/mail-helper'),
      cloudant = require("./helpers/cloudant"),
      personalityHelper = require('./helpers/personality-insights'),
      profileFromTweets = personalityHelper.profileFromTweets,
      profileFromText = personalityHelper.profileFromText,
      adminUser = process.env.USER_ADMIN || appEnv.getEnvVar('USER_ADMIN');

module.exports = (app) => {

  app.get("/", function(req, res) {
    res.render("index", {
      title: "Women Workshop"
    });
  });

  app.get("/loginStats", function(req,res) {
    res.render("loginStats")
  })

  app.get("/loginStatsMail", function(req,res) {
    res.render("loginStatsMail")
  })

  app.get("/stats", function(req, res) {
    if (req.body.Username != adminUser) {
      res.redirect('loginStats');
    } else {
        res.send("TODO OK");
      }
  }); // -- end get /stats

app.post("/stats", function(req, res) {
  if (req.body.Username != adminUser) {
    res.redirect('loginStats');
  } else {
    var usuarios;
    cloudant.listUsers(function(a) {
      if(a == false || a == undefined ) {
        res.render("error", {
          error: "No hay datos, base de datos vacia."
        });
      } else {
        res.render("stats", {
          results: a
        });
      }
    });
  }
}); // fin /stats

  app.get("/statsMail", function(req, res) {
    if (req.body.Username != adminUser) {
      res.redirect('loginStatsMail');
    } else {
      res.send("TODO OK");
    }
  });

  app.post("/statsMail", function(req, res) {
    cloudant.listUsers(function(a) {
      if(a == false || a == undefined ) {
        res.render("error", {
          error: "No hay datos, base de datos vacia."
        });
      } else {
        res.render("statsMail", {
          results: a
        });
      }
    });
  });

  app.post("/statsOK", function(req, res) {

    var valorBoton = req.body.valorBoton;

    var validado;
    var mailEnviado;

    if(req.body.validado == true) {
      validado = true;
    } else {
      validado = false;
    }

    if(req.body.mailEnviado == true) {
      mailEnviado = true;
    } else {
      mailEnviado = false;
    }

    var _id = req.body.id,
        _rev = req.body.rev,
        nombre = req.body.name,
        email = req.body.email,
        orgTxt = req.body.orgText, // Nombre de organizacion
        explaination = req.body.explaination, // Por que estas en el evento?
        date = req.body.date;

    var from = "mail@test.com",
        subject = "TESTING 2.0";

    console.log(valorBoton);

    if(valorBoton == "usuarioAValidar") {
      if(mailEnviado == false){
        validarUsuario(true, false);
      } else {
        validarUsuario(true, true);
      }

    } else if(valorBoton == "enviarMailReject") {
      enviarMail(false, "Disculpanos " + nombre + ", no fuiste seleccionado. La proxima sera!");

    } else if(valorBoton == "enviarMailApproved") {
      enviarMail(true, "Bienivenid@ " + nombre + " al evento!");

    }

    function validarUsuario(isValid, isMailSent) {
      var a = cloudant.updateUser(_id, _rev, nombre, email, isValid, isMailSent, orgTxt, explaination, date);
      if(a == false) {
        res.render("statsOK", {
          message:"Error al validar al usuario. La Base de Datos no esta funcionando!"
        });
      } else {
        res.render("statsOK", {
          message:"Usuario validado correctamente. Vuelva y siga validando!"
        });
      }
    }

    function enviarMail(isValid, content) {
      var b = mailHelper.sendMail(from, subject, email, content);

      if(b == false) {
        cloudant.updateUser(_id, _rev, nombre, email, isValid, false, orgTxt, explaination, date);

        res.render("statsOK", {
          message:"Error al enviar mail. Algo falla!! "
        });
      } else {
        cloudant.updateUser(_id, _rev, nombre, email, isValid, true, orgTxt, explaination, date);
        res.render("statsOK", {
          // message: "Mail fallo. Intente nuevamente. Mas detalles: " + error
          message: "Mail enviado! Haga clic en 'Atras' para seguir enviado mails"
        });
      }
    }

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

    cloudant.insertUser(name, email, false, false, orgTxt, explain);

    res.render("response", {
      title: "¡Muchas gracias!",
      name: name,
      email: email,
      orgTxt: orgTxt,
      explain: explain
    });
  });

}
