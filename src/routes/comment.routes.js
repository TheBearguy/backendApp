import { Router } from "express";
import { getVideoComments } from "../controllers/comment.controller.js";

const router = Router();

// Call controllers here to perform the task for a particular method request.

router.route("/vid-comments/:videoId").get(getVideoComments);

export default router;      