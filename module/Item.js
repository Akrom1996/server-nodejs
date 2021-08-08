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
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  chats: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    required: true,
  },
  position: {
    type: String,
    default: null,
  },
  price: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }
});

const Item = mongoose.model("items", ItemSchema);

module.exports = Item;