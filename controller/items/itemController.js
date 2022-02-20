const connection = require("../../module/database");
const {
    minioClient
} = require('../../module/minio');
const path = require("path")
const uuid = require("uuid").v4;
const itemModel = require('../../module/Item');
require('dotenv').config();
const User = require("../../module/User");
const {
    sendToTopicFunction
} = require("../firebase/notificationController");
const {
    query
} = require("express");


function deleteProfileOrItemImage(images) {
    return new Promise((resolve, reject) => {
        minioClient.removeObjects('p2p-market', images, function (err, data) {
            if (err) {
                //console.log(err)
                reject(err)
            } else {
                //console.log("Successfully deleted p2p-market/", images);
                resolve(data)
            }
        });

    });
}

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
                        message: "Ushbu jihoz tarmoqda mavjud emas yoki o'chirilgan"
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
    const {
        skip
    } = req.query
    //console.log(currentLocation);
    try {
        await itemModel.find({
                "location": currentLocation,
                "status": {
                    $nin: ["unpaid", "paid"]
                }
            })
            .skip(Number(skip))
            .limit(15)
            .sort({
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

//For searching items
exports.getItemsByLocationStartsWith = async (req, res) => {
    const {
        currentLocation
    } = req.params;
    const {
        value
    } = req.query
    //console.log(currentLocation);
    try {
        await itemModel.find({
            "location": currentLocation,
            "title": {
                $regex: value, //value + ".*",/^value/
                $options: 'i'
            },
            "status": {
                $nin: ["unpaid", "paid"]
            }
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

exports.getItemsByCategory = async (req, res) => {
    const {
        position,
        category,

    } = req.params;
    const {
        itemId,
        title,
        skip
    } = req.query
    // console.log(req.query.skip);
    if (itemId) {
        itemModel.find({
                "location": position,
                $or: [{
                    "category": category,
                }, {
                    "title": /title/
                }],
                "_id": {
                    $nin: itemId
                },
                "status": {
                    $ne: "unpaid"
                }
            })

            .sort({
                "likes": -1
            })
            .limit(14)
            .then((results) => {
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: results
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    error: error,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                });
            })
    } else {
        itemModel.find({
                "location": position,
                "category": category
            }, )
            .sort({
                "postTime": -1
            })
            .skip(Number(skip))
            .limit(15)
            .then((results) => {
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: results
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    error: error,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                });
            })

    }
}

exports.getItemsById = async (req, res) => {
    const
        itemIds = req.query.itemIds;
    var queryParam = []

    Array.isArray(itemIds) ? queryParam = itemIds : queryParam.push(itemIds)
    itemModel.find({
            "_id": {
                $in: [...queryParam]
            }
        })
        .sort({
            "postTime": -1
        })
        .then((results) => {
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: results
            });
        }).catch((error) => {
            return res.status(400).json({
                error: error,
                errorCode: "1",
                message: "BAD_REQUEST"
            });
        })
}

exports.getItemsOfUser = async (req, res) => {
    const {
        userId
    } = req.params;
    //console.log(userId);
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
        itemId,
    } = req.params;
    const {
        toUser,
        position
    } = req.body;
    try {
        if (toUser) {
            await User.findByIdAndUpdate(toUser, {
                $addToSet: {
                    "boughts": itemId
                }
            }, )
        }

        await itemModel.findByIdAndUpdate(itemId, {
            "position": position
        }, (err, results) => {
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
    //console.log(req.body);
    let obj = {}

    if (type === "likes") {
        obj[type] = Number(number);
        //console.log(obj);
        Promise.all([
            await itemModel.findByIdAndUpdate(itemId, {
                $inc: obj
            }, {
                returnOriginal: false,
            }),
            Number(number) === 1 ? await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    likedItems: itemId
                }

            }) :
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    likedItems: itemId
                }
            })
        ]).then((results) => {
            //console.log(results);
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

exports.getGlobalItems = async (req, res) => {
    const {
        status
    } = req.params;
    itemModel.find({
            "status": status
        }, )
        .limit(30)
        .then((data) => {
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: data
            });
        }).catch((error) => {
            return res.status(400).json({
                error: error,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        })
}

//post item
exports.uploadItemImages = async (req, res) => {
    //console.log(req.files);
    let file_name = [];
    //first upload item images to minio
    if (req.files !== undefined)
        req.files.map((file) => {
            file_name.push("/images/item-images/" + uuid() + path.extname(file.originalname));
            //console.log(file_name);
            minioClient.putObject("p2p-market", file_name[file_name.length - 1], file.buffer, function (error, etag) {
                if (error) {
                    //console.log(error);
                    return res.status(500).json({
                        error
                    })
                }
                // //console.log(etag);

            });
        });
    else
        file_name = "null"

    var input = req.body;
    input.images = file_name;
    input.location = req.params.currentLocation;

    // var uploadedFilePath = []
    // req.files.map((file) => uploadedFilePath.push(file.originalname));
    //console.log(req.params);
    const item = new itemModel(input);
    item.save().then(() => User.findOne({
            "phoneNumber": req.params.phoneNumber
        }).then((user) => {
            // //console.log("user", user);
            user.items.push(item);
            item.user = user;
            item.save();
            return user.save();
        })
        .then(async (data) => {
            var title = item.title.split(' ')[0]
            //console.log("title ", title);
            // item["user"] = item.user._id;
            //console.log("item ", item);
            if (item["status"] == "unpaid") return;

            return await sendToTopicFunction(item._id, title)
        })
        .then((data) => {
            // //console.log(data);
            // //console.log(item);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
            });
        })).catch((err) => {
        //console.log(err);
        return res.status(400).json({
            error: err,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    });
}

exports.favouriteItems = async (req, res) => {
    //console.log(req.body);
    const {
        id,
        lists,
        favourites,
        boughts,
        skip
    } = req.body;
    var results = [];
    let count = 0;
    const user = await User.findById(id, );
    let items;
    if (lists) items = user.items;
    else if (favourites) items = user.likedItems;
    else items = user.boughts;
    if (items.length === 0 || items.length < skip) {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: [],
        });
    }
    var element = [];
    for (let i = skip; i < skip + 15; i++) {
        if (items[i] == null) break;
        element.push(items[i])
    }

    // items.forEach(async (element) => {
    await itemModel.find({
            "_id": {
                $in: [...element]
            },

        }).sort({
            "postTime": -1
        })
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    errorCode: "1",
                    message: "BAD_REQUEST"
                })
            }
            // results.push(result);
            // count++;
            // if (count === items.length) {
            // console.log(result);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result
            });
            // }

        })



}

exports.deleteItemById = async (req, res) => {
    const {
        itemId
    } = req.params;
    //console.log(itemId);
    itemModel.findByIdAndDelete({
        _id: req.params.itemId
    }).then((data) => {
        if (data.images.length > 0) {
            deleteProfileOrItemImage(data.images)
        }
        User.updateMany({}, {
                $pull: {
                    likedItems: itemId,
                    items: itemId,
                    boughts: itemId
                }
            }, {
                multi: true,
            })
            .then((data) => {
                //console.log("user likes", data);
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: data,
                });
            })
            .catch((error) => console.log(error));
    }).catch((err) => {
        return res.status(400).json({
            error: err.message,
            errorCode: "1",
            message: "BAD_REQUEST"
        });
    })
}

// exports.postItem = async (req, res) => {
//     //console.log(req.params);
//     const user = await User.findOne({
//         "phoneNumber": req.params.phoneNumber
//     })
//     //console.log(user._id);
//     var input = req.body;
//     input.user = user._id;
//     input.location = req.params.currentLocation;
//     //console.log(input);
//     const item = new itemModel(input);
//     try {
//         var result = await item.save();
//         //console.log(result);
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