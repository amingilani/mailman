// Configuration for Chain
var Chain = require('chain-node'),
    chain = new Chain({
      keyId: '4a203d2a273f13746d84a32bf98710b8',
      keySecret: '9c74e6749ae104d5f366cf8fc3584d0d',
      blockChain: 'testnet3'
      });

var address = 'mncRhEz8t9ZmiBeiYPta7Cj1gW4DmUdRnT'.
    tX = '0f40015ddbb8a05e26bbacfb70b6074daa1990b813ba9bc70b7ac5b0b6ee2c45';

// SWITCHING TO TESTNET!

// balance sent and recieved, confirmed and unconfirmed
chain.getAddress('mncRhEz8t9ZmiBeiYPta7Cj1gW4DmUdRnT', function(err, resp) {
  console.log(resp);
});

// transaction information by tx hash
chain.getTransaction('0f40015ddbb8a05e26bbacfb70b6074daa1990b813ba9bc70b7ac5b0b6ee2c45', function(err, resp) {
  console.log(resp);
});
