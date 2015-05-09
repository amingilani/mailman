var config = require('./config/config');
var mongoose = require('mongoose');
mongoose.connect(config.db.url());
var User = require('./models/user.js');
// var Transaction = require('../models/transaction.js'); // Transaction model

var dummyschema = mongoose.Schema({
  account: Number,
  refAccount: Number,
  refMailId: Number,
  credit: Boolean,
  address: String,
  amount: Number,
  tx: String
});

var dummyTx = mongoose.model('dummyTx', dummyschema);

var c = {};
c.map = function() {emit("credit", this.amount);};
c.reduce = function(key, values) { return Array.sum(values);};
c.query = { account : 1, credit: true };
c.out = {inline:1};

var d = {};
d.map = function() {emit("debit", this.amount);};
d.reduce = function(key, values) { return Array.sum(values);};
d.query = { account : 1, credit: false };
d.out = {inline:1};

dummyTx.mapReduce(c, function (error, credit) {
  dummyTx.mapReduce(d, function (err, debit) {
    console.log(credit['0'].value - debit['0'].value);
  });
});

/*
var credit, debit, balance;

dummyTx.find({account: 1}).map(function(tx) {
  if (tx.credit) {credit += tx.amount;} else {debit += tx.amount;}
});


dummyTx.find({

}, function(err, tx) {
  if (err) {
    console.log(err);
  } else {
    var lol;
    lol += tx.amount;
    console.log(lol);
  }
});




for (var i = 0; i < 500; i++) {

  var newdummytx = new dummyTx();

  newdummytx.account = Math.floor(Math.random() * 4) + 1;

  while (newdummytx.refAccount === newdummytx.account || newdummytx.refAccount === undefined) {
    newdummytx.refAccount = Math.floor(Math.random() * 4) + 1;
  }
  newdummytx.credit = Math.floor(Math.random() * 2);
  newdummytx.amount = Math.floor(Math.random() * 100);
  newdummytx.save(console.log(i+1));


}
*/
/*

Transaction.find({'local.email' : 'aminshahgilani@gmail.com'}, function(err, user) {
  if (err) {console.log(err);} else {
  console.log(user.local.password);
}});


User.findOne({'local.email' : 'aminshahgilani@gmail.com'}, function(err, user) {
  if (err) {console.log(err);} else {
  console.log(user.local.password);
}});


    Client = require('coinbase').Client,
    client = new Client({
      'apiKey'    : config.coinbase.testnet.key,
      'apiSecret' : config.coinbase.testnet.secret,
      'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
    });

    var Account   = require('coinbase').model.Account;
    var btcAccount = new Account(client, {'id': '55335c04fb9854796c00000c'});

console.log({
  'apiKey'    : config.coinbase.testnet.key,
  'apiSecret' : config.coinbase.testnet.secret
});


client.getAccounts(function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name +
    ' id:' + acct.id);
  });
});


var lol;

btcAccount.createAddress({
  "callback_url": '',
  "label": "tester"
  }, function(err, address) {
    if (err) {
      console.log(err);
      } else {
        lol = address;
        console.log(lol.address);
      }
});

var s = "foo";
if (s.indexOf("oo")) {console.log(true);}

var str = 'Re: Re: FWD: (No Subject)'

while (str.indexOf('[RE:]' || '(RE)' || 'Re: ' || 'FWD: ' || 'FW: '))
*/
