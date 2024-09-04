/** @format */

import { default as Conversation, default as Participants } from "../../models/conversation.Model.js";
import Message from "../../models/message.Model.js";
import { getReceiverSocketId, io } from "../../socket/socket.js";

// send and recive message Controller**************************************
export const sendMessage = async (req, res) => {
    try {
        const userId = req.id;
        const receiverId = req.params.id;

        const { textMessage: message } = req.body;
        // console.log(message);

        // these two user to chats each others
        let conversition = await Participants.findOne({
            participants: { $all: [userId, receiverId] }, // this line check you talk the user in before
        });

        // establish the connection if user not talk started yet.
        if (!conversition) {
            conversition = await Participants.create({
                participants: [userId, receiverId], // two users to talk each others
            });
        }

        const newMessage = await Message.create({
            senderId: userId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversition.messages.push(newMessage._id);
        }

        await Promise.all([conversition.save(), newMessage.save()]);

        // implement sockit.io for real time data send
        // hum jis user ko messaage send karange ous user ki id hume chiyesa

        // Send the messages inn real time
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            // {io.to() } ek method hota hai jiski madad se hum ye batate hai ki message kiske passs jayega
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({
            success: true,
            newMessage,
        });
    } catch (error) {
        console.log(`Cannot send Message : ${error}`);
    }
};

// Get all Messages Controller**************************************

export const getAllMessage = async (req, res) => {
    try {
        const userId = req.id;
        const receiverId = req.params.id;

        // get only these user messages they are talk to each other

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] },
        }).populate("messages");

        if (!conversation) {
            res.status(200).json({
                success: true,
                message: [],
            });
        }

        res.status(200).json({
            success: true,
            message: conversation?.messages,
        });
    } catch (error) {
        console.log(`cannot get All Messages : ${error}`);
    }
};
