const express = require("express");
const {
    getItems,
    getItemInfo,
    // postItem,
    getItemsByLocation,
    getItemsOfUser,
    updatePosition,
    incDecLikes,
    uploadItemImages,
    favouriteItems,
    deleteItemById,
} = require("./itemController");
const Multer = require("multer");
const path = require("path")
const router = express.Router();


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
// get all items by location
router.get("/getItemsByLocation/:currentLocation", getItemsByLocation);

// get Item info
router.get('/getItemInfo/:itemId', getItemInfo);

// get All Items of an user

router.get("/getItemsOfUser/:userId", getItemsOfUser);

// post an item by location
router.post("/postItem/:currentLocation/:phoneNumber", Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 10000000
        },
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).array("upload", 8), uploadItemImages),

    // update item position
router.put("/updatePosition/:itemId", updatePosition)

router.put("/updateLikes/:itemId", incDecLikes)

router.post("/favouriteItems", favouriteItems)

router.delete("/deleteItem/:itemId", deleteItemById);
module.exports = router;