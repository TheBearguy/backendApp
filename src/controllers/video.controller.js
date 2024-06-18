import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiRresponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js"



const allVideos = asyncHandler(async (req, res) => {
    // TODO : get all videos on the home page

    const {page = '1', limit = "10", sortBy, sortType, query, userId} = req.query;
    // console.log(req.query);

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    console.log(req.query);

    if (!userId) {
        throw new ApiError(400, 
            "User not found"
        )
    }

    if (!query) {
        throw new ApiError(
            400, 
            "no query provided"
        )
    }

    console.log('Raw Query:', query);
    // console.log(typeof query);
    
    // const searchQuery = typeof query === 'string' ? query : JSON.stringify(query);

    // Standard practice of creating filters for searches on the page
    // Its better than just displaying the content on an endless page

    const sortingCriteria = {}
    // This is how we'll get to know which user is requesting for a particular video

    // Gathering data about what to search
    const searchVideo = {
        userId: userId,
        $or: [
            { title: {$regex: new RegExp(query, 'i')}},
            { description:  {$regex: new RegExp(query, 'i')}  }
        ]
    };
    console.log(searchVideo);
    
    if(sortBy) {
        sortingCriteria[sortBy] = sortType === "desc"? -1 : 1;
    }
    // search with the sorting criteria for some limit per page and keep a reference of how many videos have been displayed so each time we know which videos to skip and which ones to begin loading from
    console.log(sortingCriteria);
    try {
        const videos = await Video.find(searchVideo)
        .sort(sortingCriteria)
        .skip((pageNumber-1) * limit)
        .limit(limitNumber)
        
        console.log(videos);
        // console.log(`VIDEOS FETCHED = ${videos}`);
        if (videos === null) {
            throw new ApiError(
                400, 
                "No such videos found / error while fetching videos"
            )
        }
    
        return res.status(200)
        .json(
            new ApiRresponse(
                200, 
                videos, 
                "All videos fetched successfully"
            )
        )
    } catch (error) {
        console.log("Error occured: " ,error);
        throw new ApiError(
            400, 
            error.message || "Error in getting videos"
        )
    }
    // res.send("hi there")
    // console.log("oye")
})
// Alternative approach: 
// Create an Aggregate, 
// create a pipeline
// add each step (like sorting, skipping, limitting) as a separate stage in the pipeline
// final output will be the filtered videos

// const allVideos = asyncHandler(async (req, res) => {
//     const aggregate = Video.aggregate();
//     const {page= 1, limit = 10, sortBy = "views", sortType = 1, query = "", userId} =  req.query;

//     if (!userId) {
//         throw new ApiError(400, 
//             "User not found"
//         )
//     }

//     if (!query) {
//         throw new ApiError(
//             400, 
//             "no query provided"
//         )
//     }

//     const pipeline = [];

//     pipeline.push(
//         {
//             $match: {
//                 userId: userId
//             }
//         }
//     )

//     pipeline.push(
//         {
//             $skip: (page - 1) * limit
//         }
//     )
//     pipeline.push(
//         {
//             $limit: parseInt(limit)
//         }
//     )

//     if (sortBy && sortType) {
//         const sortStage = {
//             $sort : {
//                 [sortBy]: sortType === "desc"? -1 : 1
//             }
//         }
    
//         pipeline.push(sortStage)
//     } else {
//         throw new ApiError(
//             400, 
//             "Some error in sorting"
//         )
//     }

// // Paginate the reuslts of the aggregate pipeline
//     Video.aggregatePaginate(aggregate, {page, limit}, pipeline)
//     .then(
//         res.status(200)
//         .json(
//             new ApiRresponse(
//                 200, 
//                 "Everything worked, you cooked good"
//             )
//         )
//     )
//     .catch((error) => {
//         console.log(error);
//         throw new ApiError(
//             400, 
//             `some error at the end: ${error}`
//         )
//     })
// })


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

    video.owner = req.user?._id
    await video.save();
    console.log(video);

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


const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(
            400, 
            "Could not find videoId for deletion"
        )
    }

    await Video.findByIdAndDelete(videoId)

    const video = await Video.findById(videoId)

    if (video) {
        throw new ApiError(
            400, 
            "Video is still there"
        )
    }

    res.status(200)
    .json(
        new ApiRresponse(
            200, 
            "Video deleted successfully"
        )
    )

})


const toggleIsPublished = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if (!videoId) {
        throw new ApiError(
            400, 
            "videoId is missing"
        )
    }

    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished;
    await video.save()

    return res.json(
        new ApiRresponse(
            200, 
            "Togglee Updated"
        )
    )

})

export {
    allVideos, 
    publishAVideo, 
    getVideoById, 
    updateVideo, 
    deleteVideo, 
    toggleIsPublished
}