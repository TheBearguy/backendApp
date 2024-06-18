import { Router } from "express";
import { addComments, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// Call controllers here to perform the task for a particular method request.

router.route("/vid-comments/:videoId").get(verifyJWT, getVideoComments);
router.route("/create/:channelId/:videoId").post(verifyJWT, addComments);
router.route("/delete-comments/:commentId").post(verifyJWT, deleteComment);
router.route("/update-comments/commentId").patch(verifyJWT, updateComment)

export default router;      