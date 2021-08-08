const connection = require("../../module/database");
const {
    minioClient
} = require('../../module/minio');
const mailer = require("nodemailer");
const path = require("path")
const uuid = require("uuid").v4;
const itemModel = require('../../module/Item');
const mongoose = require("mongoose")
require('dotenv').config();
const Multer = require("multer");
const User = require("../../module/User");


exports.getItemInfo = async (req, res) => {
    const {
        itemId
    } = req.params;
    try {
        await itemModel.findById(
            itemId, (err, results) => {
                if (err) {
                    return res.status(400).json({
                        error: err.message,
                        errorCode: "1",
                        message: "BAD_REQUEST"
                    })
                } else if (results === null) {
                    return res.status(403).json({
                        error: "BAD_REQUEST",
                        errorCode: "1",
                        message: "Ushbu jihoz tarmoqda mavjud emas"
                    })
                }
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: results
                });
            })
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.postItem = async (req, res) => {
    console.log(req.params);
    const userId = await User.findOne({
        "phoneNumber": req.params.phoneNumber
    })
    console.log(userId._id);
    // for (key in input) {
    //     if (input.hasOwnProperty(key)) {
    //         console.log(key + " = " + input[key]);
    //     }
    // }    
    var input = req.body;
    input.user = userId._id;
    input.location = req.params.currentLocation;
    console.log(input);
    const item = new itemModel(input);
    try {
        await item.save();
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS"
        });

    } catch (error) {
        res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        });
    }

}

exports.getItemsByLocation = async (req, res) => {
    const {
        currentLocation
    } = req.params;
    try {
        await itemModel.find({
            "location": currentLocation
        }, (err, results) => {
            if (err) {
                return res.status(400).json({
                    error: err.message,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                })
            } else if (results === null) {
                return res.status(403).json({
                    error: "BAD_REQUEST",
                    errorCode: "1",
                    message: "Ushbu jihoz tarmoqda mavjud emas"
                })
            }
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: results
            });
        })
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.getItemsOfUser = async (req, res) => {
    const {
        userId
    } = req.params;
    console.log(userId);
    try {
        await itemModel.find({
            "user": userId
        }, (err, results) => {
            if (err) {
                return res.status(400).json({
                    error: err.message,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                })
            } else if (results === null) {
                return res.status(403).json({
                    error: "BAD_REQUEST",
                    errorCode: "1",
                    message: "Ushbu jihoz tarmoqda mavjud emas"
                })
            }
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: results
            });
        })
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.updatePosition = async (req, res) => {
    const {
        itemId
    } = req.params;
    try {
        await itemModel.findByIdAndUpdate(itemId, req.body, (err, results) => {
            if (err) {
                return res.status(400).json({
                    error: err.message,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                })
            } else if (results === null) {
                return res.status(403).json({
                    error: "BAD_REQUEST",
                    errorCode: "1",
                    message: "Ushbu jihoz tarmoqda mavjud emas"
                })
            }
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: results
            });
        })
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.incDecLikes = async (req, res) => {
    const {
        itemId,
    } = req.params;
    const {
        type,
        number,

    } = req.body;
    console.log(req.body);
    let obj = {}
    obj[type] = Number(number);

    console.log(obj);
    try {
        await itemModel.findByIdAndUpdate(itemId, {
            $inc: obj
        }, {
            new: true
        }, ).exec((err, results) => {
            if (err) {
                return res.status(400).json({
                    error: err.message,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                })
            } else if (results === null) {
                return res.status(403).json({
                    error: "BAD_REQUEST",
                    errorCode: "1",
                    message: "Ushbu jihoz tarmoqda mavjud emas"
                })
            }
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: results
            });
        })
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}