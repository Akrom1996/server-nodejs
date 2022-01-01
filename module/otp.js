const mongoose = require("mongoose");

const OTPSchema = mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true,
    },

}, {
    timestamps: true
});


const OTPModel = mongoose.model("otp", OTPSchema);

module.exports = {
    OTPModel
};