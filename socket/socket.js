/** @format */

import express from "express";
import http from "http";
import { Server } from "socket.io";

// create a server to send messages form one user to another user

const app = express();

// using http to create a server and pass the app
const server = http.createServer(app);

// create a new Instance of Server To import form sockit.io and pass origin and method to the server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});

// create a socket.io map to store user SOCKET id
// NOTE => Har User is ek socket.io ID hoti hai
// ek map create karange socket.io ke help se ous main oun users ki Socket id store hogi jo user hamare app main login honge
// or isi sockit id ke help se hum ye pta kar sakte hai ki kon sa user online hai
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// create a connection to using socket.io
io.on("connection", (socket) => {
    // hume connection baanane ke liye users ki id chiye hoti hai
    const userId = socket.handshake.query.userId;

    // agar hume user id mil jate hai to iska matlab hai ki user login ho gya hai
    // tb hum ye pta kar sakte hai ki kon sa user online hai

    if (userId) {
        // fir hum userSocketMap main ous userid ki help se ous user ko ek socket.id assign kar denge
        userSocketMap[userId] = socket.id;
        // console.log(`User Connected: User Id : ${userId} and Socket Id is : ${socket.id}`);
    }

    // ye ek event hota hai jise hum frontend main ek listner ke help se access kar sakte hai
    // Object.keys(userSocketMap) ye code hume  {userSocketMap} objct ke ander jitne bhe users ki id hogi vo sub hume get karke de dega or frontend main send kar dega
    // jis se frontend main hum ye pta kar sakte hai ki kon sa user online hai
    io.emit("getOnlineUser", Object.keys(userSocketMap));

    // agar user disconnect ho jata hai to hume userSocketMap se Ous user ki userId delete karne hogii
    socket.on("disconnect", () => {
        if (userId) {
            // console.log(`User DisConnected: User Id : ${userId} and Socket Id is : ${socket.id}`);
            delete userSocketMap[userId];
        }
        // is bar jo users disconnect ho gye hai vo hume pta chal jayega
        io.emit("getOnlineUser", Object.keys(userSocketMap));
    });
});

export { app, io, server };
