import { Schema } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req ,res) => {
    const {videoId} = req.params;

    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }

    // check if th user has already liked the video 
    const videoIsLiked = Like.findOne(
        {
            video: videoId, 
            likedBy: req.user._id
        }
    )
    // if he has not liked the video previously then like the video
    if (!videoIsLiked) {
        const like = await Like.create(
            {
                video:videoId, 
                likedBy: req.user._id
            }
        )

        if (!like) {
            throw new ApiError(
                400, 
                "Video could not be liked"
            )
        }
    }  else {
        // if the user has already liked the video then unlike the video
        await Like.findByIdAndDelete(videoIsLiked._id)
    }
    

    const videoLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )
    let isVideoLiked ;
    if (!videoLiked) {
        isVideoLiked: false
    } else {
        isVideoLiked: true
    }

    return res.status(200).json(new ApiResponse(200, { isVideoLiked }, " video liked"))

})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(
            400,
            "No such commentId found"
        )
    }
// Check if the user has already liked the comment
    const isCommentLiked = await Like.findOne(
        {
            commentId : commentId, 
            likedBy: req.user._id
        }
    )
// if the user has not liked the comment then like the comment
    if (!isCommentLiked) {
        const like = await Like.create(
            {
                commentId: commentId,
                likedBy: req.user._id
            }
        )
        if (!like) {
            throw new ApiError(400, "Error while liking the comment");
        } 
    } else {
        // if the user has already liked the comment then unlike the comment
        await Like.findByIdAndDelete(isCommentLiked._id)
    }

    let isLiked;
    
    if (!isLiked) {
        isCommentLiked = false
    } else {
        isCommentLiked = true
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
             { isCommentLiked },
              "like status")
            )

})


const toggleTweetPostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        throw new ApiError(400, "post id is missing")
    }
// check if the user has already liked the tweet
    const isLiked = await Like.findOne(
        {
            tweet: postId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const likedPost = await Like.create(
            {
                tweet: postId,
                likedBy: req.user._id
            }
        )
        if (!likedPost) {
            throw new ApiError(400, "error while liking post")
        }
    } else {
        // if the user has already liked the tweet then unlike the tweet
        await Like.findByIdAndDelete(isLiked._id);
    }

    const like = await Like.findOne(
        {
            tweet: postId,
            likedBy: req.user._id
        }
    )

    let isTweetLiked;
// if the user has not liked the tweet then set the isTweetLiked to false
    if (!like) {
        isTweetLiked = false
    } else {
        // if the user has liked the tweet then set the isTweetLiked to true
        isTweetLiked = true
    }

    return res.status(200).json(new ApiResponse(200, { isTweetLiked }, "tweet like status"))
})


const getAllLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.find(
        {
            likedBy: req.user._id,
            video:{$ne: null}
        }
    ).populate("video")

    if (!likedVideos) {
        throw new ApiError(400,"error while fetching liked videos")
    }
    
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked video fetched"))
})

export { toggleVideoLike, toggleCommentLike, toggleTweetPostLike,getAllLikedVideos }
