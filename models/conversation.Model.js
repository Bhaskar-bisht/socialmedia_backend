/** @format */

import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        participants: [
            {
                // this participant The TWO Users To Send Messages To Each Others
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
    },
    { timeStamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
