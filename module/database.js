const mysql = require('mysql');
require('dotenv').config();
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);
const {
  MongoClient,
} = require("mongodb");
const HOST_NAME = process.env.DB_HOSTNAME;
const PORT = process.env.DB_PORT
const USER_NAME = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
mongoose.connect(`mongodb://${HOST_NAME}:${PORT}/myKarrot?authSource=myKarrot&w=1`, {

    auth: {
      user: USER_NAME,
      password: PASSWORD,
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
const client = new MongoClient(`mongodb://${USER_NAME}:${PASSWORD}@${HOST_NAME}:${PORT}/myKarrot?authSource=admin`, {
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