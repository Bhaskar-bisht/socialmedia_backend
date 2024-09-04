import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
    // This User Send The Message for Other Users
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // This User Receive the Message, Which Message Send The Other User OR Sender User
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        require: true,
    }
},{timeStamps: true})


const Message = mongoose.model('Message', messageSchema)

export default Message