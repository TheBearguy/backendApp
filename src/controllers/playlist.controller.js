import { ApiError } from "../utils/ApiError.js";
import { ApiRresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(
            400, 
            "Need to fill all required fields to create a playlist"
        )
    }

    const playlist = await Playlist.create(
        {
            name, 
            description
        }
    )

    if (!playlist) {
        throw new ApiError(
            400, 
            "Some error occured while creating the playlist"
        )
    }

    playlist.owner = req.user?._id

    await playlist.save()

    res.status(200)
    .json(
        new ApiRresponse(
            200, 
            playlist, 
            "Playlist Created"
        )
    )

})

const addVideos = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    
    if (!videoId || !playlistId) {
        throw new ApiError(
            400, 
            "Need all required fields to add a video to a playlist"
        )
    }

    const playlist = await Playlist.findById(playlistId);

})