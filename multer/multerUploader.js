const multer = require("multer");
const path = require("path")

const singleMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single("upload");

const multiMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).array("upload", 6);
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|heic|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    // const mimetype = filetypes.test(file.mimetype);
    if (extname) {
        return cb(null, true);
    } else {
        return cb("E`lon joylashda muammo bor. Qoidalarga ko'ra .jpeg, .jpg, .png, .gif, .heic turidagi va 10 MB gacha rasmlarni joylashingiz mumkin.");
    }
}

const uploadAvatar =  (req, res, next) => {
    singleMulter(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log("error in multer")
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "Yuklashda xatolik sodir bo'ldi"
            })
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("error in uploading, ", err)
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "Yuklashda xatolik sodir bo'ldi"
            })
        }
        // Everything went fine. 
        next()
    })
}
const uploadMultiImages = (req,res, next)=>{
    multiMulter(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log("error in multer")
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "Yuklashda xatolik sodir bo'ldi"
            })
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("error in uploading, ", err)
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "Yuklashda xatolik sodir bo'ldi"
            })
        }
        // Everything went fine. 
        next()
    })
}

module.exports = {
    uploadAvatar, uploadMultiImages,singleMulter
}