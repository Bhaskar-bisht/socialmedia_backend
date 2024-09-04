/** @format */

import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        postCaption: {
            type: String,
            default: "",
        },
        postImage: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
    },
    { timeStamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
