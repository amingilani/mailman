var mongoose = require('mongoose');


var transactionSchema = mongoose.Schema({
  refAccount: Number,
  refMailId: Number,
  credit: Boolean,
  address: String,
  amount: Number,
  tx: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
