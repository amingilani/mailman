// This code operates the transaction ledger

var mongoose = require('mongoose');
var Transaction = require('../models/transaction.js'); // Transaction model

var ledger = {};

ledger.methods.record = function (user_id, mail_id, txCallback, credit) {

var transaction = new Transaction();
transaction.user_id = user_id;
transaction.mail_id = mail_id;
transaction.credit = credit;
transaction.address = txCallback.address;
transaction.amount = txCallback.amount;
transaction.tx = txCallback.transaction.hash;

};

ledger.methods.getBalance = function (user_id) {
Transaction.find({ 'transaction.user_id' : user_id }, function(err, transaction );

module.exports = ledger
