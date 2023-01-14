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
const locations = require("./locations")
const {
    sendItemToBot
} = require("../../bot/senderBotController")
const {
    publishMessage
} = require("../../mq/rabbit")
const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response");
const Item = require("../../module/Item");
const {
    admin
} = require("../firebase/getToken");

async function getNearNeighbours(location) {
    var globalLocation
    if (location === null || location === undefined) return "Andijan";
    return new Promise((resolve, reject) => {
        locations.forEach(e => {
            for (let i = 0; i < Object.values(e).length; i++) {
                var local;
                local = Object.values(e)[i].filter(loc => {
                    // console.log(loc.replace(/[^a-zA-Z]+/, '').toUpperCase())
                    return loc.replace(/[^a-zA-Z]+/, '').toUpperCase() == location.replace(/[^a-zA-Z]+/, '').toUpperCase()
                })
                if (local.length != 0) {
                    globalLocation = Object.keys(e)[i]
                    break
                } else
                    globalLocation = location
            }
            resolve(globalLocation)
        });
    })

}

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

exports.updateTable = async (req, res) => {
    console.log("update");
    await itemModel.updateMany({}, [{
        $set: {
            likes: []
        }
    }], {
        multi: true
    })
    res.end();
}

exports.getItemInfo = async (req, res) => {
    const {
        itemId
    } = req.params;
    try {
        await itemModel.findById(
            itemId, (err, results) => {
                if (err) {
                    return res.status(400).json(
                        new ErrorResponse(err.message, "1", "BAD_REQUEST")
                    )
                } else if (results === null) {
                    return res.status(403).json(
                        new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas yoki o'chirilgan")
                    )
                }
                return res.status(200).json(
                    new SuccessResponse(null, "0", "SUCCESS", results)
                );
            })
    } catch (error) {
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
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
    let locationResult = await getNearNeighbours(currentLocation)
    try {
        await itemModel.find({
                "location": locationResult, //currentLocation
                "status": {
                    $nin: ["unpaid", "paid"] //, 
                }
            })
            .skip(Number(skip))
            .limit(15)
            .sort({
                "postTime": -1
            }).exec((err, results) => {
                if (err) {
                    return res.status(400).json(new ErrorResponse(err.message, "1", "BAD_REQUEST"))
                } else if (results === null) {
                    return res.status(403).json(
                        new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas")
                    )
                }
                return res.status(200).json(
                    new SuccessResponse(null, "0", " SUCCESS", results)
                );
            })
    } catch (error) {
        return res.status(400).json(
            new ErrorResponse(error, "1", "BAD_REQUEST")
        )
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
    let locationResult = await getNearNeighbours(currentLocation)
    try {
        await itemModel.find({
            "location": locationResult, //currentLocation,
            "title": {
                $regex: value, //value + ".*",/^value/
                $options: 'i'
            },
            "status": {
                $ne: "unpaid"
                // $nin: ["unpaid", "paid"]
            }
        }).sort({
            "postTime": -1
        }).exec((err, results) => {
            if (err) {
                return res.status(400).json(new ErrorResponse(err.message, "1", "BAD_REQUEST"))
            } else if (results === null) {
                return res.status(403).json(new ErrorResponse("BAD_REQUEST", "1", "Ushbu turdagi jihozlar tarmoqda mavjud emas"))
            }
            return res.status(200).json(
                new SuccessResponse(null, "0", "Success", results)
            );
        })
    } catch (error) {
        return res.status(400).json(
            new ErrorResponse(error, "1", "BAD_REQUEST")
        )
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
    let locationResult = await getNearNeighbours(position)
    // Recommended items
    if (itemId) {
        itemModel.find({
                "location": locationResult, //position,
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
                return res.status(200).json(new SuccessResponse(null, "0", "Success", results));
            })
            .catch((error) => {
                return res.status(400).json(
                    new ErrorResponse(error, "1", "BAD_REQUEST")
                );
            })
    } else {
        itemModel.find({
                "location": locationResult, //position,
                "category": category,

            }, )
            .sort({
                "postTime": -1
            })
            .skip(Number(skip))
            .limit(15)
            .then((results) => {
                return res.status(200).json(new SuccessResponse(null, "0", "Success", results));
            })
            .catch((error) => {
                return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"));
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
            return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

        }).catch((error) => {
            return res.status(400).json(
                new ErrorResponse(error, "1", "BAD_REQUEST")
            )
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
                return res.status(400).json(
                    new ErrorResponse(err.message, "1", "BAD_REQUEST")
                )
            } else if (results === null) {
                return res.status(403).json(new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas"))
            }
            return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

        })
    } catch (error) {
        return res.status(400).json(
            new ErrorResponse(error, "1", "BAD_REQUEST")
        )
    }
}

exports.updatePosition = async (req, res) => {
    const {
        itemId,
    } = req.params;
    const {
        toUser,
        position,
        postTime
    } = req.body;
    // console.log(postTime);
    let locationResult = await getNearNeighbours(position)
    try {
        if (toUser) {
            await User.findByIdAndUpdate(toUser, {
                $addToSet: {
                    "boughts": itemId
                }
            }, )
        }
        if (postTime) {
            // console.log("updating post time");
            await itemModel.findByIdAndUpdate(itemId, {
                "postTime": postTime
            }, (err, results) => {
                if (err) {
                    return res.status(400).json(
                        new ErrorResponse(err.message, "1", "BAD_REQUEST")
                    )
                } else if (results === null) {
                    return res.status(403).json(new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas"))
                }
                return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

            })
        } else
            await itemModel.findByIdAndUpdate(itemId, {
                "position": locationResult, //position
            }, (err, results) => {
                if (err) {
                    return res.status(400).json(
                        new ErrorResponse(err.message, "1", "BAD_REQUEST")
                    )
                } else if (results === null) {
                    return res.status(403).json(new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas"))
                }
                return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

            })
    } catch (error) {
        return res.status(400).json(
            new ErrorResponse(error, "1", "BAD_REQUEST")
        )
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

    if (type === "likes") {
        Promise.all([
            Number(number) === 1 ?
            await itemModel.findByIdAndUpdate(itemId, {
                $addToSet: {
                    likes: userId
                }
            }, {
                returnOriginal: false,
            }) :
            await itemModel.findByIdAndUpdate(itemId, {
                $pull: {
                    likes: userId
                }
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
        ]).then(async (results) => {
            if (Number(number) === 1) {
                const item = await itemModel.findById(itemId);
                const userIdOfSeller = item.user;
                // console.log(typeof userIdOfSeller, typeof userId);
                // if (userIdOfSeller != userId) {
                    const seller = await User.findById(userIdOfSeller);
                    // if(!seller.items.filter(itemNId => itemNId === itemId)){

                    // // }
                    const sellerFcmToken = seller.fcmToken;
                    const options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };
                    const fcmMessage = {
                        notification: {
                            title: "Mahsulotingiz baholandi",
                            body: `${item.title.split(' ')[0]} mahsulotingiz ${seller.userName} tomonidan yoqtirildi`,
                            sound: "default",
                            image: `http://${process.env.HOST}:${process.env.MINIO_PORT}/p2p-market/images/app-images/logo.png` //9bf98691-8225-4e3c-93f0-75b61d9ebbc1.jpg`
                        },
                        data: {
                            type: "like notification",
                            click_action: "FLUTTER_NOTIFICATION_CLICK",
                        },
                    };
                    admin.messaging().sendToDevice(sellerFcmToken, fcmMessage, options).then(data => console.log(data)).catch(err => console.log(err))
                } // sending notification if item is liked
            // }
            return res.status(200).json(new SuccessResponse(null, "0", "Success", null));

        }).catch((err) => {
            return res.status(400).json(
                new ErrorResponse(err, "1", "BAD_REQUEST")
            )
        })
    } else if (type === "views") {
        await itemModel.findByIdAndUpdate(itemId, {
                $addToSet: {
                    views: userId
                }
            },
            (err, results) => {
                if (err) {
                    return res.status(400).json(
                        new ErrorResponse(err.message, "1", "BAD_REQUEST")
                    )
                } else if (results === null) {
                    return res.status(403).json(new ErrorResponse("BAD_REQUEST", "1", "Ushbu jihoz tarmoqda mavjud emas"))
                }
                return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

            }
        )
    }
}

exports.getGlobalItems = async (req, res) => {
    const {
        status
    } = req.params;
    itemModel.find({
            "status": status
        }, )
        .sort({
            "postTime": -1
        })
        .limit(40)
        .then((results) => {
            return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

        }).catch((error) => {
            return res.status(400).json(
                new ErrorResponse(error, "1", "BAD_REQUEST")
            )
        })
}

//post item
exports.uploadItemImages = async (req, res) => {
    console.log(req.params);
    //check
    var results;
    try {
        results = await User.findOne({
            phoneNumber: req.params.phoneNumber
        })
        var items = await itemModel.find({
            "_id": {
                $in: [...results.items]
            }
        });
    } catch (error) {
        return res.status(400).json(new ErrorResponse(error, "3", "BAD_REQUEST"))
    }



    let counter = 0;
    items.forEach((element) => {
        var createdDate = new Date(element.createdAt);
        var today = new Date();
        if (createdDate.getDate() == today.getDate() && createdDate.getMonth() == today.getMonth() && createdDate.getFullYear() == today.getFullYear()) {
            counter++
        }
    })
    if (counter > 20)
        return res.status(500).json({
            error: "error",
            errorCode: "1",
            message: "Kechirasiz foydalanuvchilar bir kunda ko'pi bilan 20 ta e`lon joylashlari mumkin"
        })


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
                        error: error,
                        errorCode: "0",
                        message: "E`lon joylashda muammo bor. Qoidalarga ko'ra .jpeg, .jpg, .png, .gif turidagi va 10 MB gacha rasmlarni joylashingiz mumkin.",
                    })
                }
                // //console.log(etag);

            });
        });
    else
        file_name = "null"

    var input = req.body;
    input.images = file_name;
    let locationResult = await getNearNeighbours(req.params.currentLocation)
    input.location = locationResult; //req.params.currentLocation;

    // var uploadedFilePath = []
    // req.files.map((file) => uploadedFilePath.push(file.originalname));
    console.log(req.body);

    const item = new itemModel(input);
    item.save().then(() => User.findOne({
            "phoneNumber": req.params.phoneNumber
        }).then((user) => {
            console.log("user", user);
            user.items.push(item);
            item.user = user;

            // sendItemToBot(input, user.id)
            input.userId = user.id;
            publishMessage(input, 'bot')
            item.save();
            return user.save();
        })
        .then(async (data) => {
            var title = item.title.split(' ')[0]
            //console.log("title ", title);
            // item["user"] = item.user._id;
            // console.log("item ", item);
            if (item["status"] == "unpaid") return;
            try {
                return await sendToTopicFunction(item._id, title);
            } catch (error) {
                console.log("notification topic error: ", error);
                return;
            }

        })
        .then((data) => {
            // //console.log(data);
            // //console.log(item);
            return res.status(200).json(new SuccessResponse(null, "0", "Success", null));

        })).catch((err) => {
        console.log("status 400: ", err);
        return res.status(400).json(
            new ErrorResponse(err, "1", "BAD_REQUEST")
        )
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
        return res.status(200).json(new SuccessResponse(null, "0", "Success", []));

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

        })
        .sort({
            "postTime": -1
        })
        .exec((err, results) => {
            if (err) {
                return res.status(400).json(
                    new ErrorResponse(err, "1", "BAD_REQUEST")
                )
            }
            // results.push(result);
            // count++;
            // if (count === items.length) {
            // console.log(result);
            return res.status(200).json(new SuccessResponse(null, "0", "Success", results));

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
    }).then(async (data) => {
        if (data.images.length > 0) {
            await deleteProfileOrItemImage(data.images)
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
                return res.status(200).json(new SuccessResponse(null, "0", "Success", data));

            })
            .catch((error) => console.log(error));
    }).catch((err) => {
        return res.status(400).json(
            new ErrorResponse(err, "3", "BAD_REQUEST")
        )
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