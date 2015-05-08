var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var emailSchema = mongoose.Schema ({
  type                :   String, // "reward" for cced mails or "incoming"
  incomingEmail       :   String, // user_id where user_id@mailman.ninja
  date                :   Date,
  from                : 	String,
  to                  : 	String,
  cc                  :   String,
  sender              : 	String,
  recipient           :   String,
  subject             : 	String,
  subjectStripped     :   String, // subject with the "re", "fwd" stripped
  bodyPlain           : 	String,
  strippedText        : 	String,
  strippedSignature   : 	String,
  bodyHtml            : 	String,
  strippedHtml        : 	String,
  attachmentCount     : 	Number,
  attachmentx         : 	String,
  messageHeaders      : 	String,
  contentIdMap        : 	String,
  btcAddress          :   String, // generated address for the email
  transaction         :   Array // the transaction id's related to this email
});
module.exports = mongoose.model('Email', emailSchema);
