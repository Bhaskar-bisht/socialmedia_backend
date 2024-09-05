/** @format */

import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { urlencoded } from "express";
import messageRoute from "./routes/messageRoutes/messsage.Route.js";
import postRoute from "./routes/postRoutes/post.Route.js";
import userRoute from "./routes/userRoutes/user.Route.js";
import { app, server } from "./socket/socket.js";
import connectDB from "./utils/Database/db.js";

const dbURI = process.env.MONGODB_URL;
const PORT = process.env.PORT || 5000;

// Default Middlewares

// This Middleware Responsible for receive a JSON Data.
app.use(express.json());

// This Middleware Responsible for receive a Cookies After Login user In Frontend
app.use(cookieParser());

// This Middleware Responsible for Receive a Form Data In Frontend
app.use(urlencoded({ extended: true }));

// This Middleware Responsible for The Request Fzorm Frontend Which Origins Comes & This Origin Access to Our server Response or Not.
const corsOptions = {
    origin: "https://socialmedia-application.vercel.app",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
};

app.use(cors(corsOptions));

// ******************************************************************************

// Call & Connect Database
connectDB(dbURI);

app.get("/", (req, res) => {
    res.send(`Server Is Running... on PORT : ${PORT}`);
});

// user all API for the user Router
app.use("/api/v1/user", userRoute);

// all messages API
app.use("/api/v1/message", messageRoute);

// all Post API
app.use("/api/v1/post", postRoute);

server.listen(PORT, () => {
    console.log(`Server is Listing on Port : ${PORT}`);
});
