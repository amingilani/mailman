var mongoose = require('mongoose');


var transactionSchema = mongoose.Schema({
  user_id: Number,
  mail_id: Number,
  credit: Boolean, 
  address: String,
  amount: Number,
  tx: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
