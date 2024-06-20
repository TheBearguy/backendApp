import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscriber, getSubscribedChannels, toggelSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggel-subscribe/:channelId").post(toggelSubscription);
router.route("channel-subs/:channelId").get(getChannelSubscriber);
router.route("/subscribed-channels/:channelId").get(getSubscribedChannels);

export default router