import { ApiError } from "../utils/ApiError.js"
import { ApiRresponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { loginUser } from "./user.controller.js"


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



export {
    getVideoComments
}