const express = require('express');
const router = express.Router();
// const path = require("path")
const {
    registrate,
    getUserInfo,
    deleteUser,
    uploadProfileImage,
    uploadItemImages,
    updateUserInfo,
    updateToken,
    getUserById,
    getStats,
    checkUserForExistance,
    updateManner,
    deleteUserImage
} = require("./userController")
const Multer = require("multer");
const {
    ensureToken
} = require('../../security/jwt');
const { uploadAvatar } = require('../../multer/multerUploader');
// Saving User Email  
// router.post('/saveEmail', saveEmail)
//check user
router.get("/checkUser/:phoneNumber", checkUserForExistance);
// User Registration
router.post('/registrate',
    uploadAvatar, registrate);
// User delete
router.delete('/deleteUser/:id/:type', ensureToken, deleteUser);
// User Image delete
router.delete('/delete-user-image/:id', ensureToken, deleteUserImage);
// Get user info
router.get('/getUser/:phoneNumber', ensureToken, getUserInfo);
//Get user by id
router.get('/getUserById/:userId', ensureToken, getUserById);
//Get stats
router.get('/getStats', /*ensureToken, */ getStats)
// Update user info
router.put("/update-user-info/:phoneNumber", ensureToken, updateUserInfo);
//update user fcm token
router.put("/update-user-fcm", updateToken);
//update user manner
router.put("/update-user-manner/:id", ensureToken, updateManner);
// Upload user image
router.post('/upload-profile-image/:phoneNumber', /*ensureToken, */ uploadProfileImage);
// Upload item images
// router.post('upload-item-images/:email', Multer({
//     storage: Multer.memoryStorage(),
//     limits: { fileSize: 10000000 },
//     fileFilter: function (req,file, cb){
//         checkFileType(file, cb);
//     }
// }).array("uploads", 10), uploadItemImages);



module.exports = router;