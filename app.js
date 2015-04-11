var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var config = require('./config');
var session      = require('express-session');
var secret = "KkldjzIRu85BZLObYMZSEas1zLqLN5LVQ5DXtnBCAAD3EKI";

/* refactor when app works
var routes = require('./routes/index');
var users = require('./routes/users');
*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // switch back to jade when templates finished

// required for passport

// session secret
app.use(session({
  /* MUST SET GENID ASAP
  genid: function(req) {
    return genuuid(); // use UUIDs for session IDs
  },
  */
  secret: secret,
  resave: false, // not sure about this, look it up
  saveUninitialized: false // not sure about this either
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
// ======
// load our routes and pass in our app and fully configured passport
require('./routes/routes.js')(app, passport);
/*
app.use('/', index);
app.use('/users', users);
*/

/* ERROR HANDLING. MUST FIX ASAP
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;
