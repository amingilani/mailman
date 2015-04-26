var mongoose = require('mongoose');


var ledgerSchema = mongoose.Schema({
  user_id: Number,
  mail_id: Number,
  Credit: Boolean, 
  address: String,
  amount: Number,
  transaction: {
    hash: String
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
