import { ApiError } from "../utils/ApiError.js";
import { ApiRresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, {mongoose} from "mongoose";
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
    if (!playlist) {
        throw new ApiError(
            400, 
            "No such playlist found"
        )
    }
    if (!playlist.videos?.includes(videoId)) {
        await playlist.videos.push(videoId);
        await playlist.save()    
    }
    
    res.status(200)
    .json(
        new ApiRresponse(
            200, 
            playlist, 
            "Video added successfully"
        )
    )
})

const getPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(
            400, 
            "Invalid playlist"
        )
    }

    // const playlist = await Playlist.findById(playlistId).populate("videos");

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playlistId)
            }
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "video", 
                foreignField: "_id",
                as: "video"
            }
        }
    ])

    if (!playlist.length) {
        throw new ApiError(
            400, 
            "Problem in fetching videos"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            playlist, 
            "Playlist with videos fetched successfully"
        )
    )
})
// get all the playlist created by a particular user
const getUserPlaylist = asyncHandler(async(req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(
            400, 
            "Faulty userId"
        )
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
    ])

    if (!userPlaylist.length) {
        throw new ApiError(
            400, 
            "error occured in fetching videos"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            userPlaylist, 
            "User Playlist fetched"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(
            400, 
            "No playlist found"
        )
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletePlaylist) {
        throw new ApiError(
            400, 
            "Error occured while deleting the playlist"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!playlistId) {
        throw new ApiError(
            400, 
            "Invalid Playlist ID"
        )
    }
    if (!name) {
        throw new ApiError(400,"name is required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        {playlistId},
        {
            name,
            description: description || ""
        }, 
        {new: true}
    )

    if (!updatePlaylist) {
        throw new ApiError(
            400, 
            "Error occured while updating the playlist"
        )
    }

    return res.json(
        new ApiRresponse(
            200, 
            updatedPlaylist, 
            "Playlist updated successfully"
        )
    )
})

const removePlaylistVideo = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(
            400, 
            "Invalid playlistId and videoId"
        )
    }

    const updatedPlaylist = await Playlist.updateOne(
        {
            _id: playlistId
        }, 
        {
            $pull: {
                videos: videoId
            }
        }
    )



    if (!updatePlaylist) {
        throw new ApiError(
            400, 
            "Error occured while removing the video"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            updatedPlaylist, 
            "Video removed successfully"
        )
    )

})

export {
    createPlaylist,
    addVideos,
    getPlaylist,
    getUserPlaylist,
    deletePlaylist,
    updatePlaylist,
    removePlaylistVideo
}