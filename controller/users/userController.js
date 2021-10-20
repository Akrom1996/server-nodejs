const connection = require("../../module/database")
const {
    minioClient
} = require('../../module/minio');
const mailer = require("nodemailer");
const path = require("path")
const uuid = require("uuid").v4;
const userModel = require('../../module/User');
const mongoose = require("mongoose")
require('dotenv').config();
const Multer = require("multer");
const Item = require("../../module/Item");

function deleteProfileOrItemImage(images) {
    return new Promise((resolve, reject) => {
        minioClient.removeObjects('p2p-market', images, function (err, data) {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                console.log("Successfully deleted p2p-market/myKey");
                resolve(data)
            }
        });

    });
}

exports.registrate = async (req, res) => {
    console.log(req.body);
    try {
        const user = new userModel(req.body);

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
        })//.then((value) => console.log(value)).catch((err) => console.log(err))
        console.log(users);

        if (users === undefined || users.length == 0) {
            await user.save();
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS"
            });
        } else {

            console.log("here error");
            return res.status(403).json({
                error: "BAD_REQUEST",
                errorCode: "1",
                message: "Ushbu raqam ro'yxatdan o'tgan"
            })
        }

    } catch (error) {
        res.status(400).json({
            error: error,
            errorCode: "2",
            message: "BAD_REQUEST"
        });
    }

}

exports.deleteUser = async (req, res) => {
    let {
        id,type
    } = req.params;
    console.log(id);
    console.log(req.body);
    if(type === 1){
        userModel.findOne({"phoneNumber": id})
        .then((user)=>id = user._id)
        .catch(err=>console.log(err));
    }
    var itemData = await Item.find({
        "user": id
    });
    // console.log("items", itemData);
    var itemImages = [];
    if (itemData.length > 0) {
        itemData.forEach((item) => {
            console.log("item: ", item);
            itemImages.push(...item.images);
        })
    }
    console.log(itemImages);
    Promise.all([
        await userModel.findByIdAndDelete({
            _id: id
        }),
        await Item.deleteMany({
            "user": id
        }),
        itemData.length != 0 ? await deleteProfileOrItemImage(itemImages) : null,

        // await deleteProfileOrItemImage([req.body.image]),


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

    // await userModel.findByIdAndRemove({
    //     _id
    // }, (err, results) => {
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
    //             message: "Ushbu foydalanuvchi tarmoqda mavjud emas"
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

exports.getUserInfo = async (req, res) => {
    console.log(req.params);
    const {
        phoneNumber
    } = req.params;
    let SQL = "SELECT * FROM users WHERE phone_number=?";
    try {

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
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.getUserById = async (req, res) => {
    console.log(req.params);
    try {

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
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    }
}

exports.updateUserInfo = async (req, res) => {
    const {
        phoneNumber
    } = req.params;
    console.log(req.body);
    console.log(req.params);

    // let SQL = "UPDATE users SET user_name = ?, address=?, image=? WHERE phone_number=?"
    try {

        await userModel.findOneAndUpdate({
            "phoneNumber": phoneNumber
        }, req.body, {
            upsert: true
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
    } catch (error) {
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })

    }
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
        cb("Error: Images Only!");
    }
}

exports.uploadProfileImage = async (req, res) => {
    try {

        upload(req, res, function (error) {
            if (error instanceof Multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).json({
                    error
                })
            } else if (error) {
                // An unknown error occurred when uploading.
                console.log(error)
                return res.status(500).json({
                    error
                })
            }


            // Everything went fine.
            console.log(req.file);
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
                    console.log(file_name);
                    await userModel.findOneAndUpdate({
                        "phoneNumber": phoneNumber
                    }, {
                        "image": file_name
                    }, {
                        upsert: true
                    }, (err, results) => {
                        if (err) {
                            return res.status(400).json({
                                error: err,
                                errorCode: "1",
                                message: "BAD_REQUEST"
                            })
                        }
                        console.log(results);

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



// let SQL = "INSERT INTO users VALUES(NULL, ?,NOW())";
// try {
//     connection.query("SELECT * FROM users WHERE phone_number = ?",[phoneNumber], (err,results)=>{
//         if(err){
//             return res.status(400).json({error:err.message,errorCode:"1",message:"BAD_REQUEST"})
//         }
//         else if(results.length>0){
//             return res.status(409).json({error:null,errorCode:"1",message:"Ushbu raqam ro'yxatdan o'tgan"})

//         }else{
//             connection.query(SQL,[[userName,phoneNumber,address,image]],(err, results)=>{
//             if(err){
//                 return res.status(400).json({error:err.message,errorCode:"1",message:"BAD_REQUEST"})
//             }
//             return res.status(200).json({error:null,errorCode:"0",message:"SUCCESS"})
//         })
//         }
//     })

// } catch (error) {
//     return res.status(400).json({error:error,errorCode:"1",message:"BAD_REQUEST"})
// }


// let SQL = "DELETE FROM users WHERE phone_number=? LIMIT 1"

// connection.query(SQL,[phoneNumber],(err,results)=>{
//     if(err){
//         return res.status(400).json({error:err.message,errorCode:"1",message:"BAD_REQUEST"})
//     }
//     return res.status(200).json({error:null,errorCode:"0",message:"SUCCESS"})

// })

// connection.query(SQL, [phoneNumber], (err, results) => {
//     if (err) {
//         return res.status(400).json({
//             error: err.message,
//             errorCode: "1",
//             message: "BAD_REQUEST"
//         })
//     }
//     console.log(results);
//     return res.status(200).json({
//         error: null,
//         errorCode: "0",
//         message: "SUCCESS",
//         data: results[0]
//     })
// })

// connection.query(SQL, [userName, address, image, phoneNumber], (err, results) => {
//     if (err) {
//         return res.status(400).json({
//             error: err.message,
//             errorCode: "1",
//             message: "BAD_REQUEST"
//         })
//     }
//     console.log(results);
//     return res.status(200).json({
//         error: null,
//         errorCode: "0",
//         message: "SUCCESS"
//     })

// })

// let sql = "UPDATE user SET profile_image = ?, full_name = ? WHERE email = ?;";
// connection.query(sql,[file_name,userName, email], (error, results)=>{
//     if(error){
//         console.log(err);
//         return res.status(500).json({error})
//     }
//     // console.log(results);
// })