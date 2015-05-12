/* REQUIREMENTS */
//////////////////
// Config
var config = require('../config/config.js'),
  secret = config.secret,
  // Express
  express = require('express'),
  router = express.Router(),
  // Models
  Mail = require('../models/email.js'), // Mail model
  User = require('../models/user.js'), // Mail model
  Transaction = require('../models/transaction.js'), // Transaction model
  // Coinbase
  fee = 1 / 2, //mailman keeps half of the money TODO find a better fee rate
  Client = require('coinbase').Client,
  client = new Client({
    'apiKey': config.coinbase.testnet.key,
    'apiSecret': config.coinbase.testnet.secret,
    'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
  }),
  Account = require('coinbase').model.Account,
  btcAccount = new Account(client, {
    'id': '55335c04fb9854796c00000c'
  }),
  // Mailgun
  Mailgun = require('mailgun').Mailgun,
  mg = new Mailgun(config.mailgun),

  // JSON Web Tokens
  jwt = require('jsonwebtoken'),

  // async
  async = require('async'),

  // Deposit Account
  depositAccount = "deposit", //that's 1337DEP
  withdrawalAccount = "withdrawal", //that's 1337WIT
  mailmanAccount = "mailman", //that's 1337COOL
  mailmanAddress = /\bmailman@mailman\.ninja\b/i; // mailman's email address in regex

module.exports = function(app, passport) {

  /* API ROUTES */

  //welcome to the api
  app.get('/api', function(req, res) {
    res.send('Welcome to the API');
  });

  // `/mailman`
  app.post('/api/mailman', mailmanGetsAMail(req, res));

  function mailmanGetsAMail(req, res) {

    res.json({
      success: true,
      message: 'recieved an object'
    });

    console.log('mailman recieved an email'); //debug

    if (!mailmanAddress.test(req.body.Cc)) {
      console.log('mailman addressed CC field: false');
    } else {
      // if mailman was CCed into the mail.
      console.log('mailman addressed CC field: true'); //debug
      findMailInDb(req);
    }
  }

  function findMailInDb(req) {

    // Regex expression to for "re:", "fw:" "fwd:", etc.
    var junkRegex = /([\[\(] *)?(RE|FWD?) *([-:;)\]][ :;\])-]*|$)|\]+ *$/igm;
    var subjectStripped = req.body.subject.replace(junkRegex, "");

    console.log('the original subject was "' + req.body.subject + '"' +
      '\nMailman stripped it to "' + subjectStripped + '"'); //debug

    Mail.findOne({
      'subjectStripped': subjectStripped
    }, handleDbResponse(err, req, mail));
  }

  function handleDbResponse(err, req, mail) {
    if (err) {
      console.log(err);
    }
    if (!mail) {
      saveNewMail(req);
    } else if (
      // the mail exists
      mail && (
        // the original sender is now the reciever
        mail.to === req.body.From &&
        // the original reciever is now the sender
        mail.from === req.body.To
      )
    ) {
      payRewardForReply(mail);
    }
  }

  function payRewardForReply(mail) {

    // if the mail exists and is being sent back from the original sender
    console.log('Recieved a reply from original sender for mail:' + mail.id); //debug

    User.findOne({
      'local.email': mail.to
    }, function(err, user) {
      if (err) {
        console.log(err);
      } else {

        calculateRewardByMailId(mail.id);
      }

    });
  }

  function calculateRewardByMailId(mailId) {
    Transaction.aggregate()
      .match({
        "$and": [{
          "mailId": mailId
        }, {
          "creditAccount": mailmanAccount
        }]
      })
      .project({
        "balance": "$amount"
      })
      .group({
        "_id": mailId,
        "total": {
          "$sum": "$balance"
        }
      })
      .exec(transferRewardByMailId());
  }

  function transferRewardByMailId(object) {

    console.log("Mail " + mail.id + " has reward " + object[0].total);
    // transfer the balance into the recepient's account
    var rewardTransaction = {
      "from": mailmanAccount,
      "to": mail.to, // the recepient of the original mail
      "amount": object[0].total // TODO calculate the amount
    };
    transferBalance(rewardTransaction, function(err) {
      if (err) console.log(err);
    });

  }

  function saveNewMail(req) {
    // if no such mail exists
    console.log('Mailman classified it as a new email'); //debug

    // save the metadata
    mail = new Mail();
    mail.type = "reward";
    mail.to = req.body.To;
    mail.recipient = req.body.recipient;
    mail.date = req.body.Date;
    mail.cc = req.body.Cc;
    mail.sender = req.body.sender;
    mail.from = req.body.from;
    mail.subject = req.body.subject;

    // check if the sender and reciever have accounts

    checkIfUserExistsByEmail(mail.to);
    checkIfUserExists(mail.from);

    // strip all re, and fwd from subject before saving as the stripped subject
    mail.subjectStripped = req.body.subject.replace(junkRegex, "");

    mail.save(createInvoiceAddress(mail));
  }

  function createInvoiceAddress(mail) {
    //create the address

    var callbackToken = jwt.sign({
      'mail_id': mail.id,
    }, secret);

    btcAccount.createAddress({
      "callback_url": 'http://the.mailman.ninja/api/payment/' +
        mail.id + '?token=' + callbackToken,
      "label": ""
    }, sendRewardInvoice(err, address));
  }

  function checkIfUserExistsByEmail(address) {
    User.findOne({
      'local.email': address
    }, saveANewUserByEmail(user));
  }

  function saveANewUserByEmail(user) {
    if (!user) {
      var newUser = new User();
      newUser.local.email = mail.to;
      newUser.save(
        console.log('Saving new user ' + newUser.id +
          ' for email address' + newUser.local.email)
      );
    }
  }

  function sendRewardInvoice(err, address) {
    // send an invoice to the sender
    mg.sendText('Mailman <mailman@mailman.ninja>', [mail.sender],
      'RE: ' + mail.subject,
      'Hi, pay the reward here: ' + mail.btcAddress,
      'noreply@mailman.ninja', {},
      function savedMail(err) {
        if (err) {
          console.log('Saved mail ' + mail.id +
            ' but unable to deliver invoice for mail ' +
            mail.id + '\nerror: ' + err);
        } else {
          console.log('Saved mail ' + mail.id +
            ' and sent invoice for reward mail');
        }
      });
  }

  // When a callback is recieved for a payment made.
  // '/payment/:mail_id'
  /*
  // Example object to be recieved
    {
    "address": "1AmB4bxKGvozGcZnSSVJoM6Q56EBhzMiQ5",
    "amount": 1.23456,
    "transaction": {
      "hash": "7b95769dce68b9aa84e4aeda8d448e6cc17695a63cc2d361318eb0f6efdf8f82"
    }
  */
  app.post('/api/payment/:mail_id', verifyPaymentToken());

  function verifyPaymentToken(req, res) {
    console.log('Recieved a payment notification with the following token\n' +
      req.query.token); //debug

    jwt.verify(req.query.token, secret, parseDecodedToken(req, decoded));
  }

  function parseDecodedToken(req, decoded) {
    if (err) {
      console.log(err);
      console.log('the token was invalid'); //debug

      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (decoded.mail_id !== req.params.mail_id) {

      console.log('Token mismatch');
      console.log('Mail ID : ' + mail_id);
      console.log('Token ID : ' + decoded.mail_id);

      return res.status(403).json({
        success: false,
        message: 'Token mismatch'
      });

    } else if (decoded) {
      req.decoded = decoded;

      console.log('Token was valid');

      res.status(200).json({
        success: true,
        message: 'Payment acknowledged'
      });

      handlePaymentNotification(req);
    }
  }

  function handlePaymentNotification(req) {
    // find the mail with this id
    Mail.findById(req.params.mail_id, handleMailDbRequest(req, mail));
  }

  function handleMailDbRequest(req, mail) {

    if (mail) {
      console.log('found mail: ' + mail.id + ' by sender ' + mail.sender); //debug
      //find the User
      User.findOne({
        "local.email": mail.sender
      }, handleNewDeposit());

      //determine what sort of mail this was
      if (mail.type === 'reward') {
        issueRewardNotification(mail);
      } // if the mail is an incoming mail sent to a user
      else if (mail.type === 'incoming') {
        forwardMailAndMoney(mail);
      }
    }

    function forwardMailAndMoney(mail) {
      //TODO write a code to forward the original email to the actual
      // reciever with a custom ReplyTo to the original sender
      console.log("Let's just pretend the email and money are" +
        "magically delivered");
    }

    function handleNewDeposit(user) {

      if (user) {
        console.log("Emailaddress belongs to user " + user.id);
      }

      // deposit the amount in the User's account
      var depositTransaction = {
        "from": depositAccount,
        "to": user.id,
        "amount": req.body.amount,
        "address": req.body.address,
        "tx": req.body.transaction.hash,
        "mailId": mail.id
      };

      transferBalance(depositTransaction);

      var mailmanTransaction = {
        "from": user.id,
        "to": mailmanAccount,
        "amount": req.body.amount,
        "mailId": mail.id
      };

      // transfer deposit to Mailman
      transferBalance(mailmanTransaction);
    }

    function issueRewardNotification(mail) {
      var originalRecipient = mail.to;
      console.log("sending mail reward notification to " +
        originalRecipient);
      // mail the person saying there is a reward available
      mg.sendText('Mailman <mailman@mailman.ninja>', [originalRecipient],
        'RE: ' + mail.subject,
        'Hi, there\'s a ' + req.body.amount + ' BTC ' +
        'reward on replying to this email.\n ' +
        'Just keep `mailman@mailman.ninja` in the CC field so that I ' +
        'know you\'ve replied!',
        'noreply@mailman.ninja', {},
        function(err) {
          if (err) {
            console.log(err + '\n' +
              'Could not send reward notifcation for mail' + mail.id);
          } else {
            console.log('Success');
          }
        });

    }

    // new mail to specifc user
    app.post('/api/mail/:user_id', function(req, res) {
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

      var callbackToken = jwt.sign({
        'mail_id': mail.id,
      }, secret);

      var addressArgs = {
        'callback_url': 'http://the.mailman.ninja/api/payment/' + mail.id +
          '?token=' + callbackToken,
        'label': mail.id
      };

      btcAccount.createAddress(addressArgs, function(err, address) {
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
              else console.log('Success');
            });
        }
      });

    });

    // User authorization (login)
    app.post('/api/user/auth', passport.authenticate('local-login', {
      successRedirect: '/user', // redirect to the user
      failureRedirect: '/', // redirect back to the home page on error
      failureFlash: true // allow flash messages
    }));

    // User signup
    app.post('/api/user/new', passport.authenticate('local-signup', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/signup', // redirect back to the signup page if there is an error
      failureFlash: true // allow flash messages
    }));

    // User logout
    app.get('/api/user/logout', function logoutTheUser(req, res) {
      req.logout();
      res.redirect('/');
    });

  }
};

function transferBalance(transactionObject, acallback) {

  /*
  // dummy transactionObject
    demTrans = {
      "from" : 1,
      "to" : 2,
      "amount" : 2,
      "address": "thisIsNotAValidAddress",
      "tx" : "thisIsNotAValidTx"
      "mailId" : "thisIsNotAValidMailId"
    };

  */

  async.series([
      /*function(callback) {
          userBalance(transactionObject.from);
          userBalance(transactionObject.to);
          callback(null);
        },*/
      function(callback) {
        transaction = new Transaction();
        if (transactionObject.address) {
          transaction.address = transactionObject.address;
        }
        if (transactionObject.tx) {
          transaction.tx = transactionObject.tx;
        }
        if (transactionObject.mailId) {
          transaction.mailId = transactionObject.mailId;
        }
        transaction.debitAccount = transactionObject.from; // with reference to the reciever
        transaction.creditAccount = transactionObject.to; // in the account of the sender
        transaction.amount = transactionObject.amount; // of the given amount
        transaction.save(function(err, transaction) {
          callback(err, transaction);
        });
      },
      function(callback) {
        console.log("Credited User " + transactionObject.to +
          " and debited User " + transactionObject.from + " by amount " +
          transaction.amount + " BTC");
        callback(null);
      }
      /*,
            function(callback) {
              userBalance(transactionObject.from);
              userBalance(transactionObject.to);
              callback(null);
            }*/
    ],
    acallback
  );
}

function userBalance(user) {
  Transaction.aggregate()
    .match({
      "$or": [{
        "debitAccount": user
      }, {
        "creditAccount": user
      }]
    })
    .project({
      "balance": {
        "$cond": [{
            "$eq": ["$debitAccount", user]
          }, {
            "$multiply": [-1, "$amount"]
          },
          "$amount"
        ]
      }
    })
    .group({
      "_id": user,
      "total": {
        "$sum": "$balance"
      }
    })
    .exec(function(err, object) {
      if (err) {
        console.log(err);
      } else {
        console.log("User " + user + " has balance " + object[0].total);
      }
    });
}

function appendTransactiontoMail(transaction) {
  if (err) {
    console.log(err);
  } else {
    // append the transaction.id to the mail
    Mail.findByIdAndUpdate(mail._id, {
        $push: {
          'transaction': transaction.id
        }
      }, {
        safe: true,
        upsert: true
      },
      function(err, model) {
        if (err) {
          console.log(err);
        }
      }
    );
  }
}
