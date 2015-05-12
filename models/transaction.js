var mongoose = require('mongoose');


var transactionSchema = mongoose.Schema({
  debitAccount: String,
  creditAccount: String,
  mailId: String,
  address: String,
  amount: Number,
  tx: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
