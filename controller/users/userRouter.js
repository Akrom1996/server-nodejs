const express = require('express');
const router = express.Router();
const path = require("path")
const {saveEmail, registrate, getUserInfo, deleteUser, uploadProfileImage, uploadItemImages,updateUserInfo,getUserById} = require("./userController")

// Saving User Email  
// router.post('/saveEmail', saveEmail)
// User Registration
router.post('/registrate', registrate);
// User delete
router.delete('/deleteUser/:phoneNumber',deleteUser);
// Get user info
router.get('/getUser/:phoneNumber',getUserInfo);
//Get user by id
router.get('/getUserById/:userId',getUserById);
// Update user info
router.put("/update-user-info/:phoneNumber",updateUserInfo);
// Upload user image
router.post('/upload-profile-image/:phoneNumber', uploadProfileImage);
// Upload item images
// router.post('upload-item-images/:email', Multer({
//     storage: Multer.memoryStorage(),
//     limits: { fileSize: 10000000 },
//     fileFilter: function (req,file, cb){
//         checkFileType(file, cb);
//     }
// }).array("uploads", 10), uploadItemImages);



module.exports = router;