import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { allVideos, getVideoById, publishAVideo } from "../controllers/video.controller.js";

const router = new Router();

router.route("/").get(allVideos)
router.route("/").post(
    upload.fields([

        {
            name: "videoFile",
            maxCount: 1
        }, 
        {
            name: "thumbnail", 
            maxCount: 1
        }

    ]), publishAVideo
)
router.route("/:videoId").get(getVideoById)

export default router;