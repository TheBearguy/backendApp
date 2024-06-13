import {Router} from "express";
import { logoutUser, loginUser, registerUser } from "../controllers/user.controller.js";
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

export default router