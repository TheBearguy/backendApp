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

    Subscription.aggregate(
        [
            {
                $match: {
                    channelId: new mongoose.Types.ObjectId(`${channelId}`)
                }
            }, 
            {
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

export {
    toggelSubscription
}