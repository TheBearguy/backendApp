import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getAllTweets, getChannelTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/").post(createCommunityTweet);
router.route("/all-tweet").get(getAllTweets);
router.route("/channel-tweet/:channelId").get(getChannelTweets);
router.route("/delete-tweet/:tweetId").post(deleteTweet);
router.route("/update-tweet/:tweetId").post(updateTweet)

export default router;