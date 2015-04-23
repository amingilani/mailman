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
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
