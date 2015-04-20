var express = require('express'),

    // the Mail Model
    Mail = require('../models/email.js'),

    // Configuration
    config = require('../config/config'),

    // coinbase
    Client = require('coinbase').Client,
    client = new Client({
      'apiKey'    : config.coinbase.testnet.key,
      'apiSecret' : config.coinbase.testnet.secret,
      'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
    });
    var Account   = require('coinbase').model.Account;
    var btcAccount = new Account(client, {'id': '55335c04fb9854796c00000c'});

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // API =================================
    // =====================================
    var apiRouter = express.Router();

    apiRouter.get('/mail', function (req, res){
      res.send('yo');

    });
    apiRouter.post('/mail', function (req, res){
      console.log(req.body.lol);
      res.send(req.body['lol-hello']);

      var mail = new Mail();
      mail.recipient = req.body.recipient;
      mail.sender = req.body.sender;
      mail.from = req.body.from;
      mail.subject = req.body.subject;
      mail.bodyPlain = req.body['body-plain'];
      mail.strippedText = req.body['stripped-text'];
      mail.strippedSignature = req.body['stripped-signature'];
      mail.bodyHtml = req.body['body-html'];
      mail.strippedHtml = req.body['stripped-html'];
      mail.attachmentCount = req.body['attachment-count'];
      mail.attachmentx = req.body['attachment-x'];
      mail.messageHeaders = req.body['message-headers'];
      mail.contentIdMap = req.body['content-id-map'];

      // save mail
      mail.save();

      //TODO add btcAddress to Schema

      // makes a new payment address
      mail.btcAddress = btcAccount.createAddress({
        "callback_url": 'http://mailman.ninja/paid/' + mail.id,
        "label": mail.id
        }, function(err, address) {
          if (err) {
            console.log(err);
            } else {
              return address;
            }
      });




    });

    apiRouter.post('/paid/:mail_id', function (req, res){
      // select the email
      Mail.findById(req.params.mail_id, function (err, mail) {
        // TODO deliver the mail

        // TODO confirm sent to the sender
      });
    });

    app.use('/api', apiRouter);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

var crypto = require('crypto'),
    shasum = function (data) {
      return crypto.createHash('sha').update(data).digest('hex');
    },
    leString = "UmmaString",
    leObject = { 'what' : 'object', 'who' : "yo' mama"};
