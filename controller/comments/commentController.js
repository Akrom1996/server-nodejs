const connection = require("../../module/database");
const userModel = require('../../module/User');
const mongoose = require("mongoose");
require('dotenv').config();
const Item = require("../../module/Item");
const {
    ObjectId
} = require('mongodb')

exports.getComments = async (req, res) => {
    //console.log(req.params);
    // LOOK UP THE POST
    Item
        .findById(req.params.itemId).lean().populate('comments')
        .then((data) => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                comments: data.comments
            });
        })
        .catch((err) => {
            //console.log(err.message);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST",
            });
        });
}

exports.postComment = async (req, res) => {
    //console.log(req.body);
    // INSTANTIATE INSTANCE OF MODEL
    const comment = new CommentModel(req.body);

    // SAVE INSTANCE OF Comment MODEL TO DB

    comment.save()
        .then(() => Item.findById(req.params.itemId))
        .then((item) => {
            item.comments.push(comment);
            return item.save();
        }).then((data) => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                comments: data.comments
            });
        })
        .catch((err) => {
            //console.log(err);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        });
}

exports.putThumb = async (req, res) => {
    const {
        itemId,
        commentId,
        userId
    } = req.params;
    const {
        value
    } = req.body;
    console.log(req.params,  value);
    value ==="true" ?
        connection.collection.updateOne({
            "_id": itemId,
            "messages.id": ObjectId(commentId)
        }, {
            $addToSet: {
                "messages.$.thumb": userId
            }
        },{returnOriginal: false}).then((data) => {
            console.log("pushed thumb",data);
            res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
            });
        })
        .catch(error => {

            res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST"
            });
        }) : connection.collection.updateOne({
            "_id": itemId,
            "messages.id": ObjectId(commentId)
        }, {
            $pull: {
                "messages.$.thumb": userId
            }
        }).then((data) => {
            console.log("pulled thumb", data);
            res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
            });
        })
        .catch(error => {

            res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST"
            });
        });
}