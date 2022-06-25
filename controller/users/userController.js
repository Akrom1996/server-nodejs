const connection = require("../../module/database")
const {
    minioClient
} = require('../../module/minio');
const path = require("path")
const uuid = require("uuid").v4;
const userModel = require('../../module/User');
require('dotenv').config();
const Multer = require("multer");
const Item = require("../../module/Item");
const jwt = require("jsonwebtoken")
const fcmModel = require("../../module/notification.js")

const {
    fcmFunc
} = require("../firebase/notificationController")
const {
    complainModel
} = require("../../module/complain");
const {
    singleMulter
} = require("../../multer/multerUploader");


function deleteProfileOrItemImage(images) {
    return new Promise((resolve, reject) => {
        minioClient.removeObjects('p2p-market', images, function (err, data) {
            if (err) {
                //console.log(err)
                reject(err)
            } else {
                //console.log("Successfully deleted p2p-market/myKey");
                resolve(data)
            }
        });

    });
}

exports.checkUserForExistance = async (req, res) => {
    userModel.find({
        "phoneNumber": req.params.phoneNumber
    }, (err, result) => {
        if (err) {
            return res.status(400).json({
                error: err.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        }
        return res.status(200).json({
            error: null,
            errorCode: "1",
            message: "Success",
            data: result
        })

    })
}

exports.registrate = async (req, res) => {
    //console.log("register");
    // console.log(req.body)
    let token = jwt.sign(req.body.phoneNumber, 'my_key')
    var user = new userModel(req.body);
    const users = await userModel.find({
        "phoneNumber": req.body.phoneNumber
    }, (err) => {
        if (err) {
            return res.status(400).json({
                error: err.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        }


    })
    //console.log("users ", users);
    // if (users === undefined || users.length == 0) {
    // var userResult = await 
    let userResult;
    let notification;
    Promise.all([
        userResult = await user.save(),
        notification = {
            fcmId: req.body.fcmToken,
            userId: userResult._id
        },
        await fcmFunc(notification),
    ]).then((result) => {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            token: token,
            data: result[0],
        })
    }).catch((error) => {
        return res.status(400).json({
            error: error,
            errorCode: "2",
            message: "BAD_REQUEST"
        });
    })

}

exports.deleteUser = async (req, res) => {
    let {
        id,
        type
    } = req.params;
    //console.log(id);
    //console.log(req.body);
    if (type === 1) {
        userModel.findOne({
                "phoneNumber": id
            })
            .then((user) => id = user._id)
            .catch(err => console.log(err));
    }
    var itemData = await Item.find({
        "user": id
    });
    // //console.log("items", itemData);
    var itemImages = [];
    if (itemData.length > 0) {
        itemData.forEach((item) => {
            //console.log("item: ", item);
            itemImages.push(...item.images);
        })
    }
    //console.log(itemImages);
    Promise.all([
        await userModel.findByIdAndDelete({
            _id: id
        }),
        await Item.deleteMany({
            "user": id
        }),
        itemData.length != 0 ? await deleteProfileOrItemImage(itemImages) : null,

        await deleteProfileOrItemImage([req.body.image]),


    ]).then((results) => {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: results
        });
    }).catch((err) => {
        return res.status(400).json({
            error: err.message,
            errorCode: "1",
            message: "BAD_REQUEST"
        });
    })
}
exports.deleteUserImage = async (req, res) => {
    const {
        id
    } = req.params;
    Promise.all([
        await userModel.findByIdAndUpdate(id, {
            "image": "null"
        }, {
            returnOriginal: false
        }),
        await deleteProfileOrItemImage([req.body.image]),
    ]).then((results) => {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: results[0]
        });
    }).catch((err) => {
        return res.status(400).json({
            error: err.message,
            errorCode: "1",
            message: "BAD_REQUEST"
        });
    })
}

exports.getUserInfo = async (req, res) => {
    //console.log(req.params);
    const {
        phoneNumber
    } = req.params;
    // jwt.verify(req.token,'my_key',async function(err,data) {
    //     //console.log(data);
    //     if(err){
    //         return res.status(403).json({
    //             error: err.message,
    //             errorCode: "1",
    //             message: "Authorization forbidden"
    //         })
    //     }
    await userModel.findOne({
        "phoneNumber": phoneNumber
    }, (err, results) => {
        if (err) {
            return res.status(400).json({
                error: err.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        } else if (results === null) {
            return res.status(400).json({
                error: "BAD_REQUEST",
                errorCode: "1",
                message: "Ushbu foydalanuvchi tarmoqda mavjud emas"
            })
        }
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: results
        });
    })
    // })
}

exports.getUserById = async (req, res) => {
    //console.log(req.params);

    // jwt.verify(req.token,'my_key_id',async function(err,data) {
    //     //console.log(data);
    //     if(err){
    //         return res.status(403).json({
    //             error: err.message,
    //             errorCode: "1",
    //             message: "Authorization forbidden"
    //         })
    //     }
    await userModel.findOne({
        "_id": req.params.userId
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
                message: "Ushbu foydalanuvchi tarmoqda mavjud emas"
            })
        }
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: results
        });
    })

    // })

}

exports.updateUserInfo = async (req, res) => {
    const {
        phoneNumber
    } = req.params;
    // console.log("body: ", req.body);
    // console.log(req.params);
    await userModel.findOneAndUpdate({
        "phoneNumber": phoneNumber
    }, req.body, {
        upsert: true,
        returnOriginal: false,
    }).then((results) => {
        // console.log(results);
        if (results === null) {
            return res.status(403).json({
                error: "BAD_REQUEST",
                errorCode: "1",
                message: "Ushbu foydalanuvchi tarmoqda mavjud emas"
            })
        }
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

exports.updateToken = async (req, res) => {
    const {
        id,
        fcmToken
    } = req.body;
    Promise.all([
            await userModel.findByIdAndUpdate(id, {
                fcmToken: fcmToken
            }, {
                returnOriginal: false
            }),

            await fcmFunc({
                fcmId: fcmToken,
                userId: id
            }),
        ])

        .then((results) => {
            //console.log(results);
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
            })
        })
}

exports.updateManner = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        manner,
        complainerId
    } = req.body;
    var complain = new complainModel({
        "complainerId": complainerId,
        "userId": id
    });
    Promise.all([
            await userModel.findByIdAndUpdate(id, {
                $push: {
                    manner: Number(manner)
                }
            }, {
                returnOriginal: false
            }),
            await complain.save()
        ])
        .then((results) => {
            //console.log(results);
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
            })
        })
}
var upload = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 10000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single("upload");


function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    // const mimetype = filetypes.test(file.mimetype);
    if (extname) {
        return cb(null, true);
    } else {
        cb("E`lon joylashda muammo bor. Qoidalarga ko'ra .jpeg, .jpg, .png, .gif turidagi va 10 MB gacha rasmlarni joylashingiz mumkin.");
    }
}

exports.uploadProfileImage = async (req, res) => {
    // console.log(req.query);
    try {
        if (req.query.oldImagePath !== "null") await deleteProfileOrItemImage([req.query.oldImagePath]) // delete old image on updating user image
        singleMulter(req, res, function (error) {
            if (error instanceof Multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).json({
                    error: "error",
                    errorCode: "1",
                    message: "Joylashda muammo sodir bo'ldi"
                })
            } else if (error) {
                // An unknown error occurred when uploading.
                //console.log(error)
                return res.status(500).json({
                    error: "error",
                    errorCode: "1",
                    message: "Noma'lum xatolik sodir bo'ldi"
                })
            }
        // Everything went fine.
        //console.log(req.file);
        let file_name;
        const {
            phoneNumber
        } = req.params;

        file_name = "/images/profile-images/" + uuid() + path.extname(req.file.originalname);
        minioClient.putObject("p2p-market",
            file_name, req.file.buffer,
            async (error, etag) => {
                if (error) {
                    return res.status(400).json({
                        error: error,
                        errorCode: "1",
                        message: "BAD_REQUEST"
                    })
                }
                //console.log(file_name);
                await userModel.findOneAndUpdate({
                    "phoneNumber": phoneNumber
                }, {
                    "image": file_name,
                    "userName": req.query.userName,
                }, {
                    upsert: true,
                    returnOriginal: false,
                }, (err, results) => {
                    if (err) {
                        return res.status(400).json({
                            error: err,
                            errorCode: "1",
                            message: "BAD_REQUEST"
                        })
                    }
                    //console.log(results);

                    return res.status(200).json({
                        error: null,
                        errorCode: "0",
                        message: "SUCCESS",
                        data: results
                    });
                });

            })
        })

    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }



}

exports.getStats = async (req, res) => {
    userModel.aggregate([{
            $match: {}
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }

    ]).then(result => {
        res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: result
        })
    }).catch((err) => {
        return res.status(400).json({
            error: err,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    })
}