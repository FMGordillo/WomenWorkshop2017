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
      pick = require('object.pick'),
      // profileFromTweets = personalityHelper.profileFromTweets,
      profileFromText = personalityHelper.profileFromText,
      adminUser = process.env.USER_ADMIN || appEnv.getEnvVar('USER_ADMIN');

// import { mjml2html } from 'mjml';

module.exports = (app) => {

  app.get("/", (req, res) => {
    res.render("index", {
      title: "Women Workshop"
    });
  });

  app.get("/loginStats", (req,res) => {
    res.render("loginStats")
  })

  app.get("/loginStatsMail", (req,res) => {
    res.render("loginStatsMail")
  })

  app.get("/stats", (req, res) => {
    if (req.body.Username != adminUser) {
      res.redirect('loginStats');
    } else {
        res.send("TODO OK");
      }
  }); // -- end get /stats

app.post("/stats", (req, res) => {
  if (req.body.Username != adminUser) {
    res.redirect('loginStats');
  } else {
    var usuarios;
    if(cloudant != undefined) {
      cloudant.listUsers( (a) => {
        if(a == false || a == undefined) {
          res.render("error", {
            error: "No hay datos; Base de datos vacia."
          });
        } else {
          res.render("stats", {
            results: a
          })
        }});
    } else {
      res.render("error", {
        error: "No hay conexion con base de datos. Vuelva a ingresar en 30 segundos."
      });
    }

  }
}); // fin /stats

  app.get("/statsMail", (req, res) => {
    if (req.body.Username != adminUser) {
      res.redirect('loginStatsMail');
    } else {
      res.send("TODO OK");
    }
  });

  app.post("/statsMail", (req, res) => {
    cloudant.listUsers((a) => {
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

  app.post("/statsOK", (req, res) => {

    var valorBoton = req.body.valorBoton;
    var valorPI = req.body.valorPI;

    var _id = req.body.id,
        _rev = req.body.rev,
        nombre = req.body.name,
        email = req.body.email,
        orgTxt = req.body.orgText, // Nombre de organizacion
        explaination = req.body.explaination, // Por que estas en el evento?
        date = req.body.date;

    var mailConfirmacion = "<h1>¡Gracias " + req.body.name + "!</h1>" +
    "<br>" +
    "<p>Est&aacute; confirmada tu participaci&oacute;n en el Workshop 'Descubr&iacute; tus Talentos'.</p>" +
    "<br>" +
    "<p>Te esperamos el pr&oacute;ximo jueves 16 de Marzo a las 14 hs en el auditorio mayor de IBM Argentina, Ingeniero Butty 275, 1er Subsuelo, CABA.</p>" +
    "<br>" +
    "<p>El link para descubrir tus talentos es el siguiente: <a href='" + encodeURI("https://womenworkshop2017arg.mybluemix.net/personalidad?id=" + _id) + "'>Link para Personality Insights</a></p>" +
    "<br>" +
    "<p>Saludos,</p>" +
    "<p>Raquel Godoy, Gerente de Ciudadan&iacute;a Corporativa de IBM</p>" +
    "<p>Argentina</p>";

    var mailRechazo = "<h1>Estimada " + req.body.name + "</h1>" +
    "<br>" +
    "<p>La convocatoria al Workshop 'Descubr&iacute; tus Talentos' super&oacute; las expectativas y lamentablemente no quedan cupos disponibles.</p>" +
    "<br>" +
    "<p>Agradecemos tu inter&eacute;s y esperamos confirmar nuevas fechas pr&oacute;ximamente.</p>" +
    "<br>" +
    "<p>Saludos,</p>" +
    "<p>Raquel Godoy, Gerente de Ciudadan&iacute;a Corporativa de IBM</p>" +
    "<p>Argentina</p>";

    var mailPI = "<h1>Estimada " + req.body.name + "</h1>" +
    "<br>" +
    "<p>El pr&oacute;ximo jueves 16 de marzo a las 14hs te esperamos en el Workshop 'Descubr&iacute; tus Talentos'.</p>" +
    "<br>" +
    // "<p>El link para descubrir tus talentos es el siguiente: <a href='" + encodeURI("https://womenworkshop2017arg.mybluemix.net/personalidad?id=" + _id) + "'>Link para Personality Insights</a></p>" +
    "<p><b>Es importante que <u>antes de asistir</u></b> puedas conocer qu&eacute; caracter&iacute;sticas de tu personalidad y talentos identifica Watson, la tecnolog&iacute;a de computaci&oacute;n cognitiva de IBM. Te invitamos a completar un test muy sencillo en el siguiente <b><a href='" + encodeURI('https://womenworkshop2017arg.mybluemix.net/personalidad?id=' + _id) + "'>link</a></b>, s&oacute;lo deb&eacute;s ingresar un texto escrito por vos y Watson analiza tu personalidad en un clic.</p>" +
    "<br>" +
    "<p>La información de tu an&aacute;lisis es personal y no se divulgar&aacute;n tus resultados individuales. Te recomendamos llevar una copia al workshop para tener presente &aacute;reas foco de desarrollo.</p>" +
    "<br>" +
    "<p>Saludos,</p>" +
    "<p>Raquel Godoy, Gerente de Ciudadan&iacute;a Corporativa de IBM</p>" +
    "<p>Argentina</p>";

    var validado;
    var mailEnviado;
    var quierePI = false;

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

    var from = "ragodoy@ar.ibm.com",
        subject = "";

    console.log(valorBoton);
    console.log(valorPI)

    // TODO mejorar estos metodos usando JQuery
    if(valorBoton == "usuarioAValidar") {
      if(mailEnviado == false){
        validarUsuario(true, false);
      } else {
        validarUsuario(true, true);
      }

    } else if(valorBoton == "enviarMailReject") {
      subject = "Confirmación Workshop de Mujeres 2017 en IBM"
      enviarMail(false, mailRechazo);

    } else if(valorBoton == "enviarMailApproved") {
      subject = "Workshop de Mujeres 2017 en IBM"
      enviarMail(true, mailConfirmacion);

    // } else if (valorBoton[0] == "mailEnviadoApproved" && valorBoton[1] == "enviarPI"){
    } else if (valorBoton[0] == "enviarPI"){
      subject = "Descubri tus talentos! - Workshop de Mujeres 2017 en IBM"
      quierePI = true;
      enviarMail(true, mailConfirmacion);
    }


    function validarUsuario(isValid, isMailSent) {

      var a = cloudant.updateUser(_id, _rev, nombre, email, isValid, isMailSent, orgTxt, explaination, date, null);
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
      var personalidad = false;
      if(quierePI) {
        personalidad = true;
      }

      console.log("QUE LE PONGO? " + personalidad)

      var b = mailHelper.sendMail(from, subject, email, content);

      if(b == false) {
        cloudant.updateUser(_id, _rev, nombre, email, isValid, false, orgTxt, explaination, date, null);

        res.render("statsOK", {
          message:"Error al enviar mail. Algo falla!! "
        });
      } else {
        cloudant.updateUser(_id, _rev, nombre, email, isValid, true, orgTxt, explaination, date, personalidad);
        res.render("statsOK", {
          // message: "Mail fallo. Intente nuevamente. Mas detalles: " + error
          message: "Mail enviado! Haga clic en 'Atras' para seguir enviado mails"
        });
      }
    }

  }); // -- fin post /statsOK

  app.get("/personalidad", (req, res) => {
    var id = req.query.id;
    var idSolved = req.query.idSolved;

    if(id != undefined) {
      cloudant.searchUser(id, (a) => {

        if(a == false || a == undefined) {
          res.render("error", {
            error: "No se encuentra el usuario registrado. ¿Ya validamos tu usuario?"
          });

        } else {
          var row = a[0];
          console.log("en search " + row._rev)
          res.render("personalidad", {
            title: "Tu personalidad",
            id: id,
            rev: row._rev, // Necesitamos el ultimo _rev para actualizar
            name: row.name,
            email: row.email,
            validado: row.validado,
            mailEnviado: row.mailEnviado,
            orgText: row.orgText,
            explaination: row.explaination,
            date: row.date
          });
        }
      }); // fin searchUser()

    } else if(idSolved != undefined) {

      var textoAnalizado;

      cloudant.searchUser(idSolved, (a) => {
        if(a == false || a == undefined) {
          res.render("error", {
            error: "No se encuentra el usuario registrado. ¿Ya validamos tu usuario?"
          });
        } else {
          var row = a[0];
          textoAnalizado = {
            language: "es",
            acceptedLanguage: "es",
            text: row.personalidad }

            profileFromText(textoAnalizado, (a) => {
              if(a == false) {
                res.render("error", {
                  error: "Error con Personality Insights."
                })

              } else {
                res.render("personalidadResponse", {
                  sunburst: a
                })
              }
            }) // -- fin profileFromText
        }
      }); // fin searchUser()

    } else {
      res.render("error", {
        error: "Debe acceder a '/personalidad' por el link del correo que le enviamos."
      });
    }
  }) // fin get personalidad

  app.post("/personalidad", (req, res, next) => {
    var id = req.body.id,
        rev = req.body.rev, // Tomamos el ultimo _rev de la busqueda anterior...
        nombre = req.body.name,
        email = req.body.email,
        orgTxt = req.body.orgText, // Nombre de organizacion
        explaination = req.body.explaination, // Por que estas en el evento?
        date = req.body.date,
        validado = req.body.validado,
        mailEnviado = req.body.mailEnviado;

    var valorBoton = req.body.valorBoton;
    console.log("boton clickeado ",valorBoton)

    var textoAnalizar = {
      language: "es",
      acceptedLanguage: "es",
      text: req.body.textoInput };

    profileFromText(textoAnalizar, (a) => {

      if(a == false) {
        res.render("error", {
          error: "Error con Personality Insights."
        })

      } else {
        if(valorBoton == "test") {
          res.render("personalidadResponse", {
            sunburst: a
          })
        } else if(valorBoton == "prod"){
          var respuesta = cloudant.updateUser(id, rev, nombre, email, validado, mailEnviado, orgTxt, explaination, date, a);

          if(respuesta == false) {
            res.render("Error", {
              error: "No se pudo guardar tu personalidad. Vuelva a intentar en otro momento, o guarde el modelo de prueba."
            });

          } else {
            res.render("personalidadResponse", {
              sunburst: a
            })
          }
        } else {
          res.send("ERROR")
        }
      } // -- fin else (a == true)
    }); // -- fin profileFromText
  })

  app.post("/response", (req, res, next) => {
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
