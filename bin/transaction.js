// This code operates the transaction ledger

var mongoose = require('mongoose');
var Transaction = require('../models/transaction.js'); // Transaction model

var ledger = {};

ledger.methods.record = function(credit, user_id, mail_id, txCallback) {

  var transaction = new Transaction();
  transaction.account = user_id;
  transaction.refAccount = "deposit";
  transaction.refMailId = mail_id;
  transaction.credit = credit;
  transaction.address = txCallback.address;
  transaction.amount = txCallback.amount;
  transaction.tx = txCallback.transaction.hash;

};

ledger.methods.getBalance = function(user_id, callback {
  Transaction.aggregate()
        .match({"account": user_id})
        .project({ "balance": { "$cond": [
                      {"$eq": [ "$credit", true ]},
                      {"$multiply": [ -1, "$amount" ]},
                      "$amount"
                   ]},
              "account": 1})
        .group({"_id": "$account","total": {"$sum": "$balance"}})
        .exec(callback);
};

ledger.methods.transferFunds = function(from, to, amount) {

  // TODO check if the user has the balance to make the transfer

  // make a new transaction
  var transactionDebit = new Transaction();
  transactionDebit.account = from; // in the account of the sender
  transactionDebit.refAccount = to; // with reference to the reciever
  transactionDebit.credit = false; // add a debit transaction
  transactionDebit.amount = amount; // of the given amount
  transactionDebit.save(
    // upon saving the Debit transaction
    function(err, tansactionDebit) {

      if (err) {
        console.log(err);
      } else {

        //make a corresponding transaction
        var transactionCredit = new Transaction();
        transactionCredit.account = transactionDebit.refAccount; // the reciever
        transactionCredit.refAccount = transactionDebit.account; // the sender
        transactionCredit.credit = true; // add a credit transaction
        transactionCredit.amount = amount; // of the same amount
        transactionCredit.save(function(err, transactionCredit) {
          if (err) {
            console.log(err);
          } else {
            console.log("Credited user-" + transactionCredit.refAccount +
              " and debited user-" + transactionCredit.account + " by amount " +
              transactionCredit.amount + "BTC");
              callback();
          }
        });
      }
    }
  );

};

module.exports = ledger;
