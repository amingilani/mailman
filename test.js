var config = require('./config/config');
var mongoose = require('mongoose');
mongoose.connect(config.db.url());
var User = require('./models/user.js');

User.findOne({key : 'fgsdfsdfsd'}, function(err, user) {
  if (err) {console.log(err);} else {
  console.log(user.local.email);
}});

/*
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
