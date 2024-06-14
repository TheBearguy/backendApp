import { Schema } from "mongoose";
import mongoose from "mongoose";

const playlistSchema = Schema(
    {

        name: {
            type: Number,
            required: true, 
            trim: true,
            index: true
        },

        description: {
            type: String, 
            required: true
        },

        videos: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }, 

        owner: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        }

    }, 
    {timestamps: true}
)

export const Playlist = mongoose.model("Playlist", playlistSchema)