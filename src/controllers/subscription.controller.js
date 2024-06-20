import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiRresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";


// The user is already login => so there is a "user" object  in the req
const toggelSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(
            400, 
            "No channelId found"
        )
    }

    const subscripton = await Subscription.findOne(
        {
            subscriber: req.user._id, 
            channel: channelId
        }
    );

    if (!subscripton) {
        await Subscription.create(
            {
                subscriber: req.user._id,
                channel: channelId
            }
        )
    } else {
        await Subscription.findByIdAndDelete(subscription._id);
    }

    let isSubscribed;
    if (!isSubscribed) {
        isSubscribed = false
    } else {
        isSubscribed = true
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "Channel Subscribed successfully"
        )
    )
})

const getChannelSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if (!channelId) {
        throw new ApiError(
            400, 
            "No channelId found"
        )
    }

    const channelSubscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    // Look for those documents that contain myself as thhe channel
                    channelId: new mongoose.Types.ObjectId(`${channelId}`)
                }
            }, 
            {
                // Now once we've got the needed documents, make the connection between  the subscriber and the user, bcoz the subscriber is nothing but some other user
                $lookup:{
                    from: "users", 
                    localField: "subscriber", 
                    foreignField: "_id" , 
                    as: "subscriber", 
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
            }, 
            // out of all the infor the document contains, do not display all of them, (user doesnt need to know them all), display on ly the ones requried
            {
                subscriber :1, 
                createdAt :1

            }
        ]
    )

    res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "All subscribers fetched"
        )
    )

})



const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(
            400, 
            "channelID not found"
        )
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                // Look for those documents that contain myself as thhe subscriber
                subscriber: new mongoose.Types.ObjectId(`${channelId}`)
            }
        }, 
        {
            // Now that we've got the documents of concern, make connection between the channel and the user, bcoz, a channel is nothing but some other user
            $lookup: {
                localField: "channel",
                from: "user", 
                foreignField: "_id", 
                as: "channel", 
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
        {
            // out of all the infor the document contains, do not display all of them, (user doesnt need to know them all), display on ly the ones requried

            $project: {
                channel: 1, 
                createdAt: 1
            }
        }
    ])

    res.status(200)
    .json(
        new ApiRresponse(
            200, 
            subscribedChannels, 
            "These are the channels you've subscribed to "
        )
    )

})


export {
    toggelSubscription, 
    getChannelSubscriber, 
    getSubscribedChannels
}