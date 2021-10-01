const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
   

    content: {
        type: String,
        required: true,
    },

    thumb: {
        type: Array,
        default: 0
    }

}, {
    timestamps: true
});


const CommentModel = mongoose.model("comments", CommentSchema);

module.exports = {
    CommentModel
};