require('dotenv').load();
var cfenv = require('../cfenv-wrapper');
var appEnv = cfenv.getAppEnv();
var exports = module.exports = {};

var helper = require('sendgrid').mail,
    sg = require('sendgrid')(process.env.SENDGRID_API_KEY || appEnv.getEnvVar("SENDGRID_API_KEY"));

exports.sendMail = function(from, subject, to_mail, content) {
  var from_email = new helper.Email(from),
      subject = subject,
      to_email = new helper.Email(to_mail),
      content = new helper.Content('text/plain', content),
      mail = new helper.Mail(from_email, subject, to_email, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    if(error) {
      return error;
      // return err;
    } else {
      return true;
      // return true;
    }
  });

}
