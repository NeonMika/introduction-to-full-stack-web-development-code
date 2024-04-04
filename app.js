var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// when user opens /login or /register, the file public/login.html should be returned
app.get(["/login", "/register"], function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

module.exports = app;
