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
    const videoIsLiked = Like.findOne(
        {
            video: videoId, 
            likedBy: req.user._id
        }
    )

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
        } else {
            Like.findByIdAndDelete(videoIsLiked._id)
        }

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

    const isCommentLiked = await Like.findOne(
        {
            commentId : commentId, 
            likedBy: req.user._id
        }
    )

    if (!isCommentLiked) {
        const like = await Like.create(
            {
                commentId: commentId,
                likedBy: req.user._id
            }
        )

        if (!like) {
            throw new ApiError(400, "Error while liking the comment");
        } else {
            await Like.findByIdAndDelete(isCommentLiked._id)
        }
    }

    let isLiked;
    
    if (!isLiked) {
        isCommentLiked = false
    } else {
        isCommentLiked = true
    }

    return res.json(
        200, 
        new ApiRresponse(200, 
            "Comment liked sucessfully"
        )
    )

})


const toggleTweetPostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        throw new ApiError(400, "post id is missing")
    }

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
        await Like.findByIdAndDelete(isLiked._id);
    }

    const like = await Like.findOne(
        {
            tweet: postId,
            likedBy: req.user._id
        }
    )

    let isTweetLiked;

    if (!like) {
        isTweetLiked = false
    } else {
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

export { toggleVideoLike, toggelCommentLike, toggleTweetPostLike,getAllLikedVideos }
