const connection = require("../../module/database");
const userModel = require('../../module/User');
const mongoose = require("mongoose");
require('dotenv').config();
const Item = require("../../module/Item");
const {
    CommentModel
} = require("../../module/comment");

exports.getComments = async (req, res) => {
    console.log(req.params);
    // LOOK UP THE POST
    Item
        .findById(req.params.itemId).lean().populate('comments')
        .then((data) => {
            console.log(data)
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                comments: data.comments
            });
        })
        .catch((err) => {
            console.log(err.message);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST",
            });
        });
}

exports.postComment = async (req, res) => {
    console.log(req.body);
    // INSTANTIATE INSTANCE OF MODEL
    const comment = new CommentModel(req.body);

    // SAVE INSTANCE OF Comment MODEL TO DB

    comment.save().then(() => Item.findById(req.params.itemId))
        .then((item) => {
            item.comments.unshift(comment);
            return item.save();
        }).then((data) => {
            console.log(data)
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                comments: data.comments
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        });
}