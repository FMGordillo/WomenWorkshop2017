require('dotenv').load();
var Cloudant  = require("cloudant"),
    cfenv = require('../cfenv-wrapper'),
    exports = module.exports = {};

var appEnv = cfenv.getAppEnv();

var isProd = null, // CAMBIAR ANTES DE INICIAR
    db = null,
    usernameDb="",
    passwordDb="",
    userAceptado="",
    dbname="women-2017";

var d = new Date(),
    date =  d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

usernameDb=process.env.CLOUDANT_USERNAME || appEnv.getServiceCreds('TuTalentoOculto-cloudantNoSQLDB').username;
usernameAPIDb=process.env.CLOUDANT_APIKEY || appEnv.getEnvVar('Db_APIKEY');
passwordAPIDb=process.env.CLOUDANT_APIPW || appEnv.getEnvVar('Db_APIPW') ;
userAceptado=process.env.USER_ADMIN || appEnv.getEnvVar('USER_ADMIN');
isProd=process.env.IS_PROD || appEnv.getEnvVar('IS_PROD');

var cloudant = Cloudant({
    account: usernameDb,
    key: usernameAPIDb,
    password: passwordAPIDb
  }, function(err, cloudant) {
  if (err)
    return console.log("Error connecting to Cloudant account %s: %s", err.message);
  if (isProd == "false") { dbname += "_test"; }
  console.log("using db:", dbname);
  db = cloudant.use(dbname);
});

exports.insertUser =  function(name, email, validado, mailEnviado, orgTxt, explaination){
  db.insert({
    "name": name,
    'email': email,
    'validado': validado,
    'mailEnviado': mailEnviado,
    'orgText': orgTxt,
    'explaination': explaination,
    'date': date
  }, function(errDb,bodyDb,headerDb) {
    if(errDb) {
      console.log("Error creating document - ", errDb.message);
      return;
    }
    console.log("all records inserted.")
  });
}

exports.updateUser = function(id, rev, name, email, validado, mailEnviado, orgTxt, explaination, fecha) {
  db.insert({
    "_id": id,
    "_rev": rev,
    "name": name,
    'email': email,
    'validado': validado,
    'mailEnviado': mailEnviado,
    'orgText': orgTxt,
    'explaination': explaination,
    'date': fecha
  }
    , function(errDb, bodyDb, headerDb) {
    if(errDb) {
      console.log("Error uploading document - ", errDb.message);
      return false;
    } else {
      console.log("all records updated.");
      return true;
    }
  });
}

exports.listUsers = function(callback) {
  db.find({selector: {_id:{ "$gt": 0}}}, function(err, body) {
    if(err) {
      console.log(err);
      callback(err);
    } else {
      callback(body.docs);
    }
  });
}
