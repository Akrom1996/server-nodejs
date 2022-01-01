const express = require("express");
const {
    getItems,
    getItemInfo,
    getGlobalItems,
    // postItem,
    getItemsByLocation,
    getItemsOfUser,
    getItemsByCategory,
    updatePosition,
    incDecLikes,
    uploadItemImages,
    favouriteItems,
    deleteItemById,
    getItemsByLocationStartsWith,
    getItemsById
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

// get items by location starts with value
router.get("/getItemsByLocationStartsWith/:currentLocation", getItemsByLocationStartsWith);

// get Item info
router.get('/getItemInfo/:itemId', getItemInfo);

// get All Items of an user

router.get("/getItemsOfUser/:userId", getItemsOfUser);

// get Items by position
router.get("/getGlobalItems/:status", getGlobalItems);

// get Items by ID
router.get("/getItemsById", getItemsById);

// get Items by category
router.get("/getItemsByCategory/:position/:category", getItemsByCategory);

// post an item by location
router.post("/postItem/:currentLocation/:phoneNumber", Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 10000000
        },
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).array("upload", 6), uploadItemImages),

    // update item position
    router.put("/updatePosition/:itemId", updatePosition)

router.put("/updateLikes/:itemId", incDecLikes)

router.post("/favouriteItems", favouriteItems)

router.delete("/deleteItem/:itemId", deleteItemById);
module.exports = router;