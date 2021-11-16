const mongoose = require("mongoose");

const OnlineSchema = new mongoose.Schema({
    onlineUsers: {
        type: Array,
        default: null,
    }
});

const onlineUsers = mongoose.model("onlines", OnlineSchema);

module.exports = onlineUsers;