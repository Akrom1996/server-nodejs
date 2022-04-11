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
    getItemsById,
    updateTable
} = require("./itemController");
const Multer = require("multer");
const path = require("path")
const router = express.Router();
const {
    ensureToken
} = require('../../security/jwt')

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
// get all items by location
router.get("/getItemsByLocation/:currentLocation", ensureToken, getItemsByLocation);

// get items by location starts with value
router.get("/getItemsByLocationStartsWith/:currentLocation", ensureToken, getItemsByLocationStartsWith);

// get Item info
router.get('/getItemInfo/:itemId', ensureToken, getItemInfo);

// get All Items of an user

router.get("/getItemsOfUser/:userId", ensureToken, getItemsOfUser);

// get Items by position
router.get("/getGlobalItems/:status", ensureToken, getGlobalItems);

// get Items by ID
router.get("/getItemsById", ensureToken, getItemsById);

// get Items by category
router.get("/getItemsByCategory/:position/:category", ensureToken, getItemsByCategory);

// post an item by location
router.post("/postItem/:currentLocation/:phoneNumber", ensureToken, Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 10000000
        },
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).array("upload", 6), uploadItemImages),

    // update item position
    router.put("/updatePosition/:itemId", ensureToken, updatePosition)

router.put("/updateLikes/:itemId", incDecLikes)

router.post("/favouriteItems", ensureToken, favouriteItems)

router.delete("/deleteItem/:itemId", ensureToken, deleteItemById);

router.put("/update",updateTable);

module.exports = router;