import { ApiError } from "../utils/ApiError.js"
import { ApiRresponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { loginUser } from "./user.controller.js"
import { Comment } from "../models/comment.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    // TODO : get all ccomments on a video
    const { videoId } = req.params

    console.log("Video ID is : ", videoID);

    if (!videoId) {
        throw new ApiError(400, "Invalid videoId")
    }
    
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }, 
        {
            $lookup: {
                from: "users", 
                localfield: "owner", 
                foreignField: "_id", 
                as: "owner", 
                pipeline: [
                    {
                        $project: {
                        fullName: 1, 
                        username: 1, 
                        avatar: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!comments) {
        throw new ApiError(
            400, 
            "No comments found on this video"
        )
    }

    return res.status(200).json(
        new ApiRresponse(
            200, 
            "Comments fetched successfully"
        )
    )

})

const addComments = asyncHandler(async (req, res) => {
    const {channelId, videoId} = req.params;
    const {content} = req.body;

    if (!videoId && !channelId) {
        throw new ApiError(
            400, 
            "videoId or ChannelId not found to add any comment"
        )
    }

    const comment = await Comment.create(
        {
            content, 
            video: videoId, 
            owner: channelId
        }
    )

    if (!comment) {
        throw new ApiError(
            400, 
            "Error occured in creating the comment"
        )
    }
    
    return res.status(200).json(
        new ApiRresponse(
            200, 
            "Comment added successfully"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    if (!commentId) {
        throw new ApiError(
            400, 
            "no commentId found"
        )
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(
            400, 
            "Comment is not yet deleted"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "Comment Deleted"
        )
    )

})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!commentId && !content) {
        throw new ApiError(
            400, 
            "commentId or Content to be updated not found"
        )
    }

    const updatedComment = Comment.findByIdAndUpdate({
        commentId
        },
        {
            $set: {
                content: content
            }
        }, 
        {new: true}
    )

    if (!updatedComment) {
        throw new ApiError(
            400, 
            "Comment updation failed"
        )
    }
    
    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "Comment updpated successfully"
        )
    )

})


export {
    getVideoComments, 
    addComments, 
    deleteComment, 
    updateComment
}