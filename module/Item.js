const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  postTime: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    default: null
  },
  likes: {
    type: Array,
    default: null,
  },
  views: {
    type: Array,
    default: null,
  },
  chats: {
    type: Array,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    required: true,
  },
  position: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
  price: {
    type: String,
    required: true
  },
  isNegotiable:{
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  comments: {
    type:Array
  },
  // [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "comments"
  // }],
}, {
  timestamps: true
});

const Item = mongoose.model("items", ItemSchema);

module.exports = Item;