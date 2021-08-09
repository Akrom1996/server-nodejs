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
  address: {
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
  items: [{type: mongoose.Schema.Types.ObjectId, ref: "items"}]
});

const User = mongoose.model("users", UserSchema);

module.exports = User;