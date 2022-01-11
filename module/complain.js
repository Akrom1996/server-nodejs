const mongoose = require("mongoose");

const complainSchema = mongoose.Schema({

    complainerId: {
        type: String,
        default: null,
    },
    userId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});


const complainModel = mongoose.model("complain", complainSchema);

module.exports = {
    complainModel
};