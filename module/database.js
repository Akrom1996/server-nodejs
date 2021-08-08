const mysql = require('mysql');
require('dotenv').config();
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useUnifiedTopology', false);
// mongoose.set('useCreateIndex', true); //useCreateIndex
mongoose.connect('mongodb://localhost:27017/myKarrot',
  (err) => {
    if (err) {
      console.error('error connecting mongoose: ' + err.stack);
      return;
    }
    console.log("Connected to mongoose")
  }
);

const connection = mysql.createConnection({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

module.exports = {
  connection,
  mongoose
};