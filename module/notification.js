const mongoose = require("mongoose");

const FCMnotification = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  fcmId: {
    type: String,
    default: null
  }
});

const FCMnotifications = mongoose.model("notifications", FCMnotification);

module.exports = FCMnotifications;