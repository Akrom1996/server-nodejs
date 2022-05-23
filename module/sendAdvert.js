const mongoose = require("mongoose");

const ADVERTSchema = mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },

    message: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        default:null,
    },

});


const ADVERTModel = mongoose.model("advert", ADVERTSchema);

module.exports = {
    ADVERTModel
};