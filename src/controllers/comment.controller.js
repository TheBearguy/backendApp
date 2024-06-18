import { ApiError } from "../utils/ApiError.js"
import { ApiRresponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"


const getVideoComments = asyncHandler(async (req, res) => {
    // TODO : get all ccomments on a video
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Invalid videoId")
    }
    
    const video = await Video.findById(
        videoId
    )

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const comments = Comment.findById({
        videoId: videoId
    })

    if (!comments) {
        throw new ApiError(400, "No comments found for this video")
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            comments, 
            "Comments fetched successfully"
        )
    )

})



export {
    getVideoComments
}