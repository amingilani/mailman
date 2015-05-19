var config = {};

config.coinbase.accId ="process.env.coinbase_acc_id";
config.coinbase.apiKey ="process.env.coinbase_api_key";
config.coinbase.apiSec ="process.env.coinbase_api_secret";
config.coinbase.apiUrl ="process.env.coinbase_api_url";
config.dbHost ="process.env.db_host";
config.dbPass ="process.env.db_pass";
config.dbUser ="process.env.db_user";
config.mailgun.apiKey ="process.env.mailgun_api_key";
config.secret ="process.env.secret";

module.exports = config;
