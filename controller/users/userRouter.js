const express = require('express');
const router = express.Router();
const path = require("path")
const {saveEmail, registrate, getUserInfo, deleteUser, uploadProfileImageAndInfo, uploadItemImages,updateUserInfo} = require("./userController")

// Saving User Email  
// router.post('/saveEmail', saveEmail)
// User Registration
router.post('/registrate', registrate);
// User delete
router.delete('/deleteUser/:phoneNumber',deleteUser);
// Get user info
router.get('/getUser/:phoneNumber',getUserInfo);
// Update user info
router.put("/update-user-info/:phoneNumber",updateUserInfo);

// Upload user image
router.post('/upload-profile-image/:phoneNumber', uploadProfileImageAndInfo);
// Upload item images
// router.post('upload-item-images/:email', Multer({
//     storage: Multer.memoryStorage(),
//     limits: { fileSize: 10000000 },
//     fileFilter: function (req,file, cb){
//         checkFileType(file, cb);
//     }
// }).array("uploads", 10), uploadItemImages);



module.exports = router;