const connection = require("../../module/database");
require('dotenv').config();
const {
    adminNotificationModel
} = require("../../module/adminNotification");
const {
    minioClient
} = require('../../module/minio');
const {
    ObjectId
} = require('mongodb')
const uuid = require("uuid").v4;
const path = require("path")

exports.getNotifications = async (req, res) => {

    adminNotificationModel
        .find()
        .sort({
            "createdAt":-1
        })
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
    var file_name = "null";
    if (req.file !== undefined) {
        file_name = "/images/notifications/" + uuid() + path.extname(req.file.originalname);
        minioClient.putObject("p2p-market", file_name, req.file.buffer, function (error, etag) {
            if (error) {
                //console.log(error);
                return res.status(500).json({
                    error
                })
            }
        });
    }
    // INSTANTIATE INSTANCE OF MODEL
    var input = req.body;
    input.image = file_name;
    const comment = new adminNotificationModel(input);

    // SAVE INSTANCE OF Comment MODEL TO DB

    comment.save()
        .then((result) => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                data: result,
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