const express = require("express");
const app = express();
    session = require('express-session'),
    cookieParser = require('cookie-parser');
require("./config/express")(app);

app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'asereje', name: "sessionId"}));

console.log(process.argv.join(" "));

require('./router')(app);
module.exports = app;
