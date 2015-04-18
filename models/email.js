var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var emailSchema = mongoose.Schema ({
  recipient           : 	String,
  sender              : 	String,
  from                : 	String,
  subject             : 	String,
  bodyPlain           : 	String,
  strippedText        : 	String,
  strippedSignature   : 	String,
  bodyHtml            : 	String,
  strippedHtml        : 	String,
  attachmentCount     : 	Number,
  attachmentx         : 	String,
  messageHeaders      : 	String,
  contentIdMap        : 	String,
  btcAddress          :   String
});
module.exports = mongoose.model('Email', emailSchema);
