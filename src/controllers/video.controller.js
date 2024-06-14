import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiRresponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js"



const allVideos = asyncHandler(async (req, res) => {
    // TODO : get all videos on the home page
    const videos = await Video.find({})
    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            videos, 
            "All videos fetched successfully"
        )
    )
    res.send("hi there")
    console.log("oye")
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    
    if (!title) {
        throw new ApiError(400, "No video title found")
    }

    if (!description) {
        throw new ApiError(400, "No video description found")
    }

    const thumbnailPath = req.files?.thumbnail[0].path

    if (!thumbnailPath) {
        throw new ApiError(400, "No thumbnail found")
    }
    
    const videoFilePath = req.files?.videoFile[0].path
    

    if(!videoFilePath) {
        throw new ApiError(400, "No videoFIle found")
    }
    console.log(" ________________VIDEOFILEPATH : ", videoFilePath)
    const videoFile = await uploadOnCloudinary(videoFilePath, {
        resource_type: "video",
    })
    console.log(videoFile);
    const thumbnail  = await uploadOnCloudinary(thumbnailPath, {
        resource_type: "image"
    })

    // if (!videoFile) {
    //     throw new ApiError(401, "VideoFile Couldnt be uploaded on cloudinary")
    // }

    // if (!thumbnail) {
    //     throw new ApiError(401, "thumbnail Couldnt be uploaded on cloudinary")
    // }
    const duration = videoFile.duration
    const video = await Video.create({
        title: title, 
        thumbnail : thumbnail.url, 
        description : description, 
        videoFile: videoFile.url,
        duration: duration
    })

    if (!video) {
        throw new ApiError(400, "Video couldnt be added in the db")
    }

    const videoUploaded = await Video.findById(video._id)
    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            videoUploaded, 
            "Vido Uploaded!"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(
            400, 
            "Invalid videoId"
        )
    }
    console.log(videoId)

    // const video = Video.findById(videoId) LOL

    const video = await Video.find({
        _id: videoId
    })

    if (!video) {
        throw new ApiError(
            400, 
            "video not found"
        )
    }

    return res.status(200)
    .json(
        new ApiRresponse(
            200, 
            video, 
            "Video fetched successfully"
        )
    )

})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    if (!title && !description) {
        throw new ApiError(
            400, 
            "All fields are required to update those fields"
        )
    }

    const thumbnailPath = req.files?.thumbnail?.path
    if (!thumbnail) {
        throw new ApiError(
            400, 
            "No thumbnail received to update it"
        )
    }

    const videoFilePath = req.files?.thumbnail?.path
    if (!thumbnail) {
        throw new ApiError(
            400, 
            "No videofile received to update it"
        )
    }

    const video = await Video.findByIdAndUpdate({
        _id: videoId
        }, 
        {
            title, 
            description
        }
    )

    const videoWithOldThumbnail = await User.findById(
        videoId
    )

    if (!videoWithOldThumbnail || !videoWithOldThumbnail.thumbnail) {
        throw new ApiError(
            400, 
            "video or thumbnail not found"
        )
    }
    const oldthumbnailCloudinaryUrl = videoWithOldThumbnail.thumbnail;
    console.log("oldthumbnailCloudinaryUrl: ", oldthumbnailCloudinaryUrl);

    const oldthumbnail = await deleteFromCloudinary(oldthumbnailCloudinaryUrl);
    console.log("Oldthumbnail: ", oldthumbnail);

    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    console.log(thumbnail);
    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }
    const user = await User.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    )


})


export {
    allVideos, 
    publishAVideo, 
    getVideoById
}