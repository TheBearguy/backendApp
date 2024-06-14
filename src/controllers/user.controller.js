import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js'
import { ApiRresponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
import mongoose, { mongo } from 'mongoose';


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();


        user.refreshToken = refreshToken;
        await user.save( { validateBeforeSave: false } )

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, error.message)
    }
} 


const registerUser = asyncHandler( async (req, res) => {
    
    // 0. get user data from frontend
    // 1. middleware = for input validation (check if empty, check if user already exists (check by username and email))
    // check for images (avatar)
    // upload them to cloudinary - verify that images are finally uploaded

    // 2. create user object and push to db (db.create())
    // Do not pass password and refreshToken to the user = remove them from the response
    // check for user creation (if it is created successfullly)
    // 3. return response

    const { fullName, email, username, password } = req.body
    // console.log(email);

    // if (fullName === "") {
    //     throw new ApiError(400, "Name is required")
    // }
    if (
        [fullName, email, username, password].some( (fields) => { return fields?.trim === ""})
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne(
        {
            $or: [
                    { username }, 
                    { email }
            ]
        }
    )
    // console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User with that credentials already exists")
    }

    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(avatarLocalPath);
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar needed ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log(avatar);
    if (!avatar) {
        throw new ApiError(400, "Avatar needed ")
    }

    const user = await User.create(
        {
            fullName, 
            avatar: avatar.url,
            email, 
            password, 
            coverImage: coverImage?.url || "",
            username: username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(
        new ApiRresponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => {
    // get data from the user (req body)
    // username or email
    // authenticate user (check username and password in db) and validate the inputs(check it its empty,etc)
    // if not authenticated: access token, refresh token
    // send cookies
    // response

    const {username, email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne(
        {
            $or: [
                {username}, 
                {email}
            ]
        }
    )

    if(!user) {
        throw new ApiError(404, "User DNE")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOny: true,
        secure: true,
    }
    // console.log(refreshToken);
    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiRresponse(
            200,
            {
                data: loggedInUser, accessToken, refreshToken
            }, 
            "User logged in successfully"
        )
    )

}) 


const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined 
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOny: true,
        secure: true,
    }

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiRresponse(
            200, 
            {}, 
            "User logged Out"
        )
    )
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = await jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiRresponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }   
    user.password =  newPassword
    await user.save( {validateBeforeSave: false} )

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            {}, 
            "Password changed Successfully"
        )
    )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            req.user, 
            "Current User fetched Successfully"
        )
    )
})

const   updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email, } = req.body
    if (!fullName && !email) {
        throw new ApiError(400, "All fields are requried")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName, 
                email: email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            user, 
            "Account details updated successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const userWithOldAvatar = await User.findById(
        req.user._id, 
    ).select("-password -refreshToken")

    if (!userWithOldAvatar || !userWithOldAvatar.avatar) {
        throw new ApiError(
            400, 
            "User or Avatar not found"
        )
    }
    const oldAvatarCloudinaryUrl = userWithOldAvatar.avatar;
    console.log("oldAvatarCloudinaryUrl: ", oldAvatarCloudinaryUrl);

    const oldAvatar = await deleteFromCloudinary(oldAvatarCloudinaryUrl);
    console.log("OldAvatar: ", oldAvatar);

    console.log(req.files);
    const avatarLocalPath = req.files?.path

    if (!avatarLocalPath) {
        new ApiError(400, "Avatar path is missing ")
    }
    console.log(avatarLocalPath);

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log(avatar);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            user, 
            "Avatar updated Successfully"
        )
    )

})

const updateUserCoverImage = asyncHandler(async (req, res)  => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(
            400, 
            "CoverImage path is missing"
        )
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(
            400, 
            "CoverImage URL missing"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:  {
                coverImage : coverImage.url,
            }
        },
        {new: true}
    )

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            user,
            "CoverImage updated Successfully"
        )
    )

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params

    if (!username) {
        throw new ApiError(
            403, 
            "Username not found"
        )
    }

    const channel = User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "channel",
                localField: "_id",
                as: "subscribers"
            }
        }, 
        {
            $lookup: {
                from: "subscriptions", 
                foreignField: subscriber,
                as: "subscribedTo"
            }
        }, 
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                }, 
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                }, 
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        }, 
                        then: true, 
                        else: false
                    }
                }
            }
        }, 
        {
            $project: {
                fullName: 1, 
                username: 1,
                subscribers: 1, 
                subscribedTo: 1, 
                channelsSubscribedToCount: 1, 
                isSubscribed: 1, 
                avatar: 1, 
                coverImage: 1, 
                email: 1, 
                createdAt: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(
            400, 
            "Channel does not exists"
        )
    }
    console.log(channel);
    return res.status(200).json(
        new ApiRresponse(
            200, 
            channel[0], 
            "User channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    // _id is not the original mongodb id, 
    // when we pass _id , mongoose internally converts it into the original mongodb id
    // however this does not work the same in case of pipelines and aggregates
    const user = User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id) // This is a way to convert the ObjectId (pseudo id) into actual mongodb id
                }
            }, 
            {
                $lookup: {
                    from: "videos", 
                    foreignField: "_id",
                    localField: "watchHistory", // for user,  it is the id of the video he has watched 
                    as: "watchHistory", 
                    pipeline: [
                        {
                            $lookup: {
                                from: "users", 
                                foreignField: "_id", 
                                localField: "owner", 
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
                        }, 
                        {
                                $addFields: {
                                    owner: {
                                        $first: "$owner"
                                    }
                                }
                        }
                    ]
                }
            }
        ]
    )

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            user[0].watchHistory, 
            "watch history fetched successfully"
        )
    )

})


export {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory

}