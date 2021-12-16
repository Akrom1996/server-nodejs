const connection = require("../../module/database");
require('dotenv').config();
const {
    adminNotificationModel
} = require("../../module/adminNotification");
const {
    ObjectId
} = require('mongodb')

exports.getNotifications = async (req, res) => {

    adminNotificationModel
        .find()
        .then((data) => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: data
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

exports.postNotification = async (req, res) => {
    //console.log(req.body);
    // INSTANTIATE INSTANCE OF MODEL
    const comment = new adminNotificationModel(req.body);

    // SAVE INSTANCE OF Comment MODEL TO DB

    comment.save()
        .then(() => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
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

exports.putView = async (req, res) => {
    const {
        messageId,
        userId
    } = req.params;
    //console.log(req.params);
    connection.collection.updateOne({
            "_id": adminNotificationModel,
        }, {
            $addToSet: {
                "views": userId
            }
        }).then((data) => {

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
        })
}