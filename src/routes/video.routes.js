import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { allVideos, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(verifyJWT, allVideos)
router.route("/").post(verifyJWT,
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
router.route("/vid/:videoId").get(verifyJWT, getVideoById)
router.route("/update-vid/:videoId").patch(verifyJWT, updateVideo)
router.route("/delete-vid/:videoId").delete(verifyJWT, updateVideo)

export default router;