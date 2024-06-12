import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: [true, "Video Video Video"]
        }, 
        thumbnail: {
            type: String, // cloudinary url
            required: [true, "Without thumbnail Video is not dope!!"]
        }, 
        title: {
            type: String, 
            required: [true, "Video Title needed"]
        }, 
        description: {
            type: String, 
            required: [true, "Video description is needed"]
        }, 
        duration: {
            type: Number, // from cloudinary url,
            required: true
        }, 
        views: {
            type: Number, 
            default: 0
        }, 
        isPublished: {
            type: Boolean, 
            default: true
        }, 
        owner: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        }
    }, 
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema) 