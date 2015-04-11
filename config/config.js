module.exports = {
  secret : "0A8WBeBzLQy4qktXwTGyqZoOahX0tCyKR0bfjO2WqNWKlvyf0O4eiNwXtJ" +
            "2Mpppcc6XIRSDoKocTkW2buV0sRYyXHWB6nq4dn9OHeKilPJOR46kcIF2" +
            "IBt02ZjGXx7Z",
  coinbase : {
        key    : "UCQ4Kuw1NotbNlCX",
        secret : "ygjISE1RKvT82hD2aRezy2j86SP5q2WM"
  },
  db : {
        user : "app",
        pass : "pNwySu3Mo3vh5ZKUJlasMJ2ZnnffFUeFoG75eA02SobPoxQruTCM7mdmd",
        host : "ds061661.mongolab.com:61661/mail-ninja",
        url :  function () {
          return "mongodb://" + this.user + ":" + this.pass + "@" + this.host;
          }

  },
  mailgun: "key-b9d0baf1ac20ef3056c83731bc0abe5a"

};
