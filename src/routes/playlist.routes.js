import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideos, createPlaylist, deletePlaylist, getPlaylist, getUserPlaylist, removePlaylistVideo, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist);
router.route("/add-videos/:playlistId/:videoId").post(verifyJWT, addVideos);
router.route("/get-playlist/:playlistId").get(getPlaylist);
router.route("/get-user-playlist/:userId").get(getUserPlaylist);
router.route("delete-playlist/:playlistId").post(deletePlaylist);
router.route("/update-playlist/:playlistId").post(updatePlaylist);
router.route("/remove-video/:playlistId/:videoId").post(removePlaylistVideo);

export default router