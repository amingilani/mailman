var mongoose = require('mongoose');


var transactionSchema = mongoose.Schema({
  debitAccount: Number,
  creditAccount: Number,
  refMailId: Number,
  address: String,
  amount: Number,
  tx: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
