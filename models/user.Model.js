/** @format */

import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        profileImg: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        follower: [
            {
                // one user are the multiple Followers so then i store followers in a Array
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                // one user are following the multiples users so then i store followings user in a Array
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        totalPost: [
            {
                // one User Post a multiples post in an account so i store in a array
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        savedPost: [
            {
                // one User saved multiples post
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
