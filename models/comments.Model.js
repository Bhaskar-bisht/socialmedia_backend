import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    text: {
        type: String,
        require: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
}, {timeStamps: true})

const Comment = mongoose.model('Comment', commentSchema)

export default Comment