const mongoose = require("mongoose");

const WalletSchema = mongoose.Schema({
    history: {
        type: Array,
        default: null
    }
}, {
    timestamps: true
});


const WalletModel = mongoose.model("wallet", WalletSchema);

module.exports = {
    WalletModel
};