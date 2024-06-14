import {Router} from "express";
import { logoutUser, loginUser, registerUser, refreshAccessToken, updateUserAvatar, updateAccountDetails, updateUserCoverImage, changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

// Call controllers here to perform the task for a particular method request.

router.route("/register").post(
    upload.fields([
            {
                name: "avatar", 
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
    ]),
    registerUser)
    // registerUser is a controller
// router.route("/login").post(login)

router.route("/login").post(loginUser)


// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("current-user").get(verifyJWT, getCurrentUser)
router.route("/upate/account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile),
router.route("/watch-history").get(verifyJWT, getWatchHistory)


export default router