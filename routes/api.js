/* REQUIREMENTS */
//////////////////
// Config
var config = require('./config/config'),
// Express
    express = require('express'),
    router = express.Router(),
// the Mail Model
    Mail = require('../models/email.js'),
// Coinbase
    Client = require('coinbase').Client,
    client = new Client({
      'apiKey'    : config.coinbase.testnet.key,
      'apiSecret' : config.coinbase.testnet.secret,
      'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
      }),
    Account   = require('coinbase').model.Account,
    btcAccount = new Account(client, {'id': '55335c04fb9854796c00000c'}),
// Mailgun
    Mailgun = require('mailgun').Mailgun,
    mg = new Mailgun(config.mailgun);

/* API ROUTES */

// `/mailman`
router.route('/mailman')


.post(function(req, res) {

  // proceed if mailman was CCed into the mail.
  if (req.body.Cc.indexOf('mailman@mailman.ninja')) {

    Mail.findOne({
      subjectStripped: req.body.subject.replace(/([\[\(] *)?(RE|FWD?) *([-:;)\]][ :;\])-]*|$)|\]+ *$/igm, "")
    }, function (err, mail) {
      if (err) {
        console.log(err);
      } else if (mail && (mail.to === req.body.from &&
        mail.from === req.body.to)) {
        // if the mail exists and is being sent back from the original sender
        // TODO pay the man


      } else if (!mail) {
        // if no such mail exists

    // save the metadata
    mail = new Mail();
    mail.type = "reward";
    mail.to = req.body.to;
    mail.date = req.body.Date;
    mail.cc = req.body.Cc;
    mail.sender = req.body.sender;
    mail.from = req.body.from;
    mail.subject = req.body.subject;

    // regex expression to find "re:", "fw:" "fwd:", etc.
    var junkRegex = /([\[\(] *)?(RE|FWD?) *([-:;)\]][ :;\])-]*|$)|\]+ *$/igm;
    // strip all re, and fwd from subject before saving as the stripped subject
    mail.subjectStripped = req.body.subject.replace(junkRegex, "");

    //create the address
    btcAccount.createAddress({
      "callback_url": 'http://mailman.ninja/api/payment/' + mail.id,
      "label": ""
      }, function(err, address) {
        if (err) {
          // output error and save mail
          console.log(err);
          mail.save();
          } else {
            // save the address and save the mail
            mail.btcAddress = address.address;
            mail.save();

            // send an invoice to the sender
            mg.sendText('Mailman <mailman@mailman.ninja>', [mail.sender],
              'RE: ' + mail.subject,
              'Hi, pay the reward here: ' + mail.btcAddress,
              'noreply@mailman.ninja', {},
              function(err) {
                if (err) console.log('Unable to deliver invoice for mail ' +
                mail.id + '\nerror: ' + err);
                else     console.log('Success');
            });
          }
        });
        // for all over errors
      }
    }
  );
}});

// When a callback is recieved for a payment made.
// '/payment/:mail_id'
router.post('/payment/:mail_id', function(req, res) {

/* Example object to be recieved

  {
  "address": "1AmB4bxKGvozGcZnSSVJoM6Q56EBhzMiQ5",
  "amount": 1.23456,
  "transaction": {
    "hash": "7b95769dce68b9aa84e4aeda8d448e6cc17695a63cc2d361318eb0f6efdf8f82"
  }
*/

  // find the mail with this id
  Mail.findById(req.params.mail_id, function (err, mail) {
    if (err) {
      console.log(err);
    } else {
      // save the callback object in the db
      mail.callbackRes = req.body;
      mail.save();

// TODO determine what sort of mail this was

    if (mail.type === 'reward') {

      // mail the person saying there is a reward available
      mg.sendText('Mailman <mailman@mailman.ninja>', [mail.to],
        'RE: ' + mail.subject,
        'Hi, there\'s a ' + req.body.amount +
        'reward on replying to this email.\n ' +
        'Just keep `mailman@mailman.ninja` so that I may know you\'ve replied!',
        'noreply@mailman.ninja', {},
        function(err) {
          if (err) console.log('Unable to deliver invoice for mail ' +
          mail.id + '\nerror: ' + err);
          else     console.log('Success');
      });
    } else if (mail.type === 'incoming') {

      // TODO deliver the email to its rightful recepient
    }
    }
  });
});

// new mail to specifc user
router.post('/mail/:user_id', function (req, res){
  console.log(req.body.lol);
  res.send(req.body['lol-hello']);

  var mail = new Mail();

  mail.type = "incoming";
  mail.incomingEmail = req.params.user.id;
  mail.to = req.body.to;
  mail.date = req.body.Date;
  mail.cc = req.body.Cc;
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

  btcAccount.createAddress({
    "callback_url": 'http://mailman.ninja/api/payment/' + mail.id,
    "label": ""
    }, function(err, address) {
      if (err) {
        // output error and save mail
        console.log(err);
        mail.save();
        } else {
          // save the address and save the mail
          mail.btcAddress = address.address;
          mail.save();

          // send an invoice to the sender
          mg.sendText('Mailman <mailman@mailman.ninja>', [mail.sender],
            'RE: ' + mail.subject,
            'Hi, your email will only be delivered if you pay for its delivery.\n' +
            'Please pay at this address: ' + mail.btcAddress,
            'noreply@mailman.ninja', {},
            function(err) {
              if (err) console.log('Unable to deliver invoice for mail ' +
              mail.id + '\nerror: ' + err);
              else     console.log('Success');
          });
        }
      });

});

// User authorization (login)
app.post('/user/auth', passport.authenticate('local-login', {
    successRedirect : '/user', // redirect to the user
    failureRedirect : '/', // redirect back to the home page on error
    failureFlash : true // allow flash messages
}));

// New user signup
app.post('/user/new', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));



module.exports = router;
