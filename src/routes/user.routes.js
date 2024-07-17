import express from 'express';
// import multer from 'multer';
// import path from 'path';
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, subscribeToChannel, unsubscribeFromChannel, updateAccountDetails, updateAvatar, updateCoverImage } from '../controllers/user.controller.js';
import upload from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
const  router = express.Router();
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const uploadPath = path.join(process.cwd(), 'upload');
//       cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${file.originalname}`);
//     }
//   })
// });

router.post('/register', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]),registerUser );


router.route("/login").post(loginUser)

// secured rutes
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)
router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
router.route("/channels/:username/subscribe").post(verifyJWT,subscribeToChannel);
router.route("/channels/:username/unsubscribe").post(verifyJWT,unsubscribeFromChannel);



export default router;