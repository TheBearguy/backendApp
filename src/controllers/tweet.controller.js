import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRresponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user?._id;

    if (!content) {
        throw new ApiError(
            400, 
            "No tweet content provided"
        )
    }

    const tweet = await Tweet.create(
        {
            content, 
            owner
        }
    )

    if (!tweet) {
        throw new ApiError(
            400, 
            "Error occured while creating the tweet"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            tweet, 
            "Tweet created successfully"
        )
    )
})

const getAllTweets = asyncHandler(async (req, res) => {
    // Tweet.find(
    //     {}
    // )

    const tweets = await Tweet.aggregate([
        {
            $match : {
                // Empty = All 
            }
        }, 
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id", 
                as: "owner", 
                pipeline: [
                    {
                        $project: {
                            username: 1, 
                            fullName: 1, 
                            avatar: 1
                        }
                    }
                ]
            }
        }, 
    ])

    if (!tweets) {
        throw new ApiError(400, "Some error occured while fetching all the tweets")
    }

    return res.status(200).json(
        new ApiRresponse(
            200, 
            tweets, 
            "all tweets fetched"
        )
    )
})

const getChannelTweets = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if (!channelId) {
        throw new ApiError(
            400, 
            "Invalid ChannelId"
        )
    }

    const channelTweets = await Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    if (!channelTweets) {
        throw new ApiError(
            400, 
            "Error occured while getting channel tweets"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            channelTweets, 
            "Channel Tweets fetched successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const deletedTweet = await Community.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError(400, "error while deleting post")
    }

    return res.status(200).json(new ApiResponse(200, deletedTweet, "tweet deleted"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const owner = req.user?._id;

    if (!content) {
        throw new ApiError(
            400, 
            "No content provided to update the tweet"
        )
    }

    const udpatedTweet = await Tweet.findByIdAndUpdate(
        {
            tweetId
        }, 
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if (!udpatedTweet) {
        throw new ApiError(
            400, 
            "Some error occured while updating the tweet"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            udpatedTweet, 
            "Tweet updated successfully"
        )
    )
})

export { 
    createTweet,
    getAllTweets,
    getChannelTweets,
    deleteTweet,
    updateTweet
}