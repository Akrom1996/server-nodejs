const express = require("express");
const {
    getItems,
    getItemInfo,
    postItem,
    getItemsByLocation,
    getItemsOfUser,
    updatePosition,
    incDecLikes
} = require("./itemController");
const router = express.Router();

// get all items by location
router.get("/getItemsByLocation/:currentLocation", getItemsByLocation);

// get Item info
router.get('/getItemInfo/:itemId', getItemInfo);

// get All Items of an user

router.get("/getItemsOfUser/:userId", getItemsOfUser);

// post an item by location
router.post("/postItem/:currentLocation/:phoneNumber", postItem),

// update item position
router.put("/updatePosition/:itemId",updatePosition)


router.put("/updateLikes/:itemId",incDecLikes)

module.exports = router;