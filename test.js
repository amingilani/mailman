var config = require('./config/config'),
    Client = require('coinbase').Client,
    client = new Client({
      'apiKey'    : config.coinbase.testnet.key,
      'apiSecret' : config.coinbase.testnet.secret,
      'baseApiUri': 'https://api.sandbox.coinbase.com/v1/'
    });

    var Account   = require('coinbase').model.Account;
    var btcAccount = new Account(client, {'id': '5526ee2611c7b478f4000372'});

console.log({
  'apiKey'    : config.coinbase.testnet.key,
  'apiSecret' : config.coinbase.testnet.secret
});

client.getAccounts(function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log('my bal: ' + acct.balance.amount + ' for ' + acct.id);
  });
});

/*

btcAccount.createAddress({
  "callback_url": "", "label": 'hello'
  }, function(err, address) {
    if (err) {console.log(err);} else {console.log(address);}
    // TODO send a reply mail containing the payment address
});
*/
