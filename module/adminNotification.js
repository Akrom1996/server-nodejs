const mongoose = require("mongoose");

const adminNotificationSchema = mongoose.Schema({

    image: {
        type: String,
        default: null,
    },
    content: {
        type: String,
        required: true,
    },

    views: {
        type: Array,
        default: null
    }

}, {
    timestamps: true
});


const adminNotificationModel = mongoose.model("adminNotification", adminNotificationSchema);

module.exports = {
    adminNotificationModel
};