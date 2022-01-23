const mysql = require('mysql');
require('dotenv').config();
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);
const {
  MongoClient,
} = require("mongodb");

mongoose.connect('mongodb://192.168.0.200:27017/myKarrot?authSource=myKarrot&w=1', {

    auth: {
      user: 'akrom96!',
      password: '12345Akrom'
    },
    authSource: "admin",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,

  },
  (err) => {
    if (err) {
      console.error('error connecting mongoose: ' + err.stack);
      return;
    }
    //console.log("Connected to mongoose")
  }
);
const client = new MongoClient("mongodb://akrom96%21:12345Akrom@192.168.0.200:27017/myKarrot?authSource=admin", {
  useUnifiedTopology: true,
 
  // akrom96%21:12345Akrom@
});
client.connect();
db = client.db("myKarrot");
const collection = db.collection("comments");
const itemCollection = db.collection("items");
const chatCollection = db.collection("chats");
const userCollection = db.collection("users");
const onlineCollection = db.collection("onlines");
const priceList = db.collection("price");
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
  collection,
  itemCollection,
  userCollection,
  chatCollection,
  db,
  priceList
};