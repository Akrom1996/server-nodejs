const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    "itemId":{
        type: String
    },
    "ownerId": {
        type: String
    },
    "userId":{
        type: String
    },
    "messages": {
        type: Array
    }
  },);

const Chat = mongoose.model("chats", ChatSchema);

module.exports = Chat;