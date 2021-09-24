const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  position:{type:Object},
  address1: {
    type: String,
    required: true,
  },
  image:{
    type: String,
    default: null,
  },
  isLogged: {
      type: Boolean,
      default:false
  },
  registeredTime: {
    type: Date,
    required: true,
  },
  manner:{
    type: Array,
    default: 36.6
  },
  likedItems: [{type: Array, }],
  boughts:[{type:Array,}],
  chats:[{type: Array,}],
  items: [{type: mongoose.Schema.Types.ObjectId, ref: "items"}],
  
});

const User = mongoose.model("users", UserSchema);

module.exports = User;