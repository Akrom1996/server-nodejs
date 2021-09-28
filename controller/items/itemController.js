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

// 
exports.getItemsByLocation = async (req, res) => {
    const {
        currentLocation
    } = req.params;
    console.log(currentLocation);
    try {
        await itemModel.find({
            "location": currentLocation
        }).sort({
            "postTime": -1
        }).exec((err, results) => {
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
                    error: err,
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
        userId
    } = req.body;
    console.log(req.body);
    let obj = {}

    if (type === "likes") {
        obj[type] = Number(number);
        console.log(obj);
        Promise.all([
            await itemModel.findByIdAndUpdate(itemId, {
                $inc: obj
            }, {
                new: false
            }),
            number === 1 ? await User.findByIdAndUpdate(userId, {
                $push: {
                    likedItems: itemId
                }
            }) :
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    likedItems: itemId
                }
            })
        ]).then((results) => {

            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
            });
        }).catch((err) => {
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST"
            });
        })
    } else if (type === "views") {
        await itemModel.findByIdAndUpdate(itemId, {
                $addToSet: {
                    views: userId
                }
            },
            (err, results) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
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
            }
        )
    }
    // await itemModel.findByIdAndUpdate(itemId, {
    //     $inc: obj
    // }, {
    //     new: true
    // }, ).exec((err, results) => {
    //     if (err) {
    //         return res.status(400).json({
    //             error: err.message,
    //             errorCode: "1",
    //             message: "BAD_REQUEST"
    //         })
    //     } else if (results === null) {
    //         return res.status(403).json({
    //             error: "BAD_REQUEST",
    //             errorCode: "1",
    //             message: "Ushbu jihoz tarmoqda mavjud emas"
    //         })
    //     }
    //     return res.status(200).json({
    //         error: null,
    //         errorCode: "0",
    //         message: "SUCCESS",
    //         data: results
    //     });
    // })

}

//post item
exports.uploadItemImages = async (req, res) => {
    console.log(req.files);
    let file_name = [];
    if (req.files !== undefined)
        req.files.map((file) => {
            file_name.push("/images/item-images/" + uuid() + path.extname(file.originalname));
            console.log(file_name);
            minioClient.putObject("p2p-market", file_name[file_name.length - 1], file.buffer, function (error, etag) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        error
                    })
                }
                // console.log(etag);

            });
        });
    else
        file_name = "null"

    var input = req.body;
    input.images = file_name;
    input.location = req.params.currentLocation;

    // var uploadedFilePath = []
    // req.files.map((file) => uploadedFilePath.push(file.originalname));
    console.log(req.params);
    const item = new itemModel(input);
    item.save().then(() => User.findOne({
        "phoneNumber": req.params.phoneNumber
    }).then((user) => {
        console.log("user", user);
        user.items.push(item);
        item.user=user;
        item.save();
        return user.save();
    }).then((data) => {
        console.log(data);
        console.log(item);
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
        });
    })).catch((err) => {
        console.log(err);
        return res.status(400).json({
            error: err,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    });
}

exports.favouriteItems = async (req, res) => {
    console.log(req.body);
    const {
        id,
        lists,
        favourites,
        boughts
    } = req.body;
    var results = [];
    let count = 0;
    const user = await User.findById(id, );
    let items;
    if (lists) items = user.items;
    else if (favourites) items = user.likedItems;
    else items = user.boughts;
    if (items.length === 0) {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: [],
        });
    }
    items.forEach(async (element) => {
        await itemModel.findById(element, )
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                        errorCode: "1",
                        message: "BAD_REQUEST"
                    })
                }
                results.push(result);
                count++;
                if (count === items.length) {
                    console.log(results);
                    return res.status(200).json({
                        error: null,
                        errorCode: "0",
                        message: "SUCCESS",
                        data: results
                    });
                }

            })

    });


}

// exports.postItem = async (req, res) => {
//     console.log(req.params);
//     const user = await User.findOne({
//         "phoneNumber": req.params.phoneNumber
//     })
//     console.log(user._id);
//     var input = req.body;
//     input.user = user._id;
//     input.location = req.params.currentLocation;
//     console.log(input);
//     const item = new itemModel(input);
//     try {
//         var result = await item.save();
//         console.log(result);
//         user.items.push(result._id);
//         await user.save();
//         return res.status(200).json({
//             error: null,
//             errorCode: "0",
//             message: "SUCCESS"
//         });

//     } catch (error) {
//         res.status(400).json({
//             error: error,
//             errorCode: "1",
//             message: "BAD_REQUEST"
//         });
//     }

// }