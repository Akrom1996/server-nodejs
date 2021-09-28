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
    postedTime: {
        type: Date,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    thumb: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});


const CommentModel = mongoose.model("comments", CommentSchema);

module.exports = {
    CommentModel
};