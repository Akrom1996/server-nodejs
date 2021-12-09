const mysql = require('mysql');
require('dotenv').config();
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);
const {
  MongoClient,
} = require("mongodb");

mongoose.connect('mongodb://localhost:27017/myKarrot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  (err) => {
    if (err) {
      console.error('error connecting mongoose: ' + err.stack);
      return;
    }
    //console.log("Connected to mongoose")
  }
);
const client = new MongoClient("mongodb://localhost:27017/myKarrot", {
    useUnifiedTopology: true
});
client.connect();
db = client.db("myKarrot");
const collection = db.collection("comments");
const itemCollection = db.collection("items");
const chatCollection = db.collection("chats");
const userCollection = db.collection("users");
const onlineCollection = db.collection("onlines");
// const connection = mysql.createConnection({
//   host: process.env.DB_HOSTNAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// connection.connect(function (err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   //console.log('connected as id ' + connection.threadId);
// });

module.exports = {
  // connection,
  mongoose,
  collection,itemCollection,userCollection,chatCollection,db
};