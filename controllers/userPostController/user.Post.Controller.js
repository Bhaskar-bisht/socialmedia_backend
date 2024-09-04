/** @format */

import sharp from "sharp";
import Comment from "../../models/comments.Model.js";
import Post from "../../models/post.Model.js";
import User from "../../models/user.Model.js";
import { getReceiverSocketId, io } from "../../socket/socket.js";
import cloudinary from "../../utils/Cloudinary/cloudinary.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const userId = req.id;

        // check the image
        if (!image) {
            res.status(400).json({
                message: "Image is required..!",
            });
        }

        // if user upload a high quality Image then reduce the quality of the image

        const optimizeImage = await sharp(image.buffer)
            .resize({
                width: 800,
                height: 800,
            })
            .toFormat("jpeg", {
                quality: 80,
            })
            .toBuffer();

        //   convert image buffer to uri
        const fileUri = `data:image/jpeg;base64,${optimizeImage.toString("base64")}`;

        //   upload image in cloudinary
        const response = await cloudinary.uploader.upload(fileUri);

        // create the post
        const post = await Post.create({
            postCaption: caption,
            postImage: response.secure_url,
            author: userId,
        });

        if (!post) {
            res.status(402).json({
                success: false,
                message: "User Post Not Created",
            });
        }

        // find the user ID

        const user = await User.findById(userId);

        if (user) {
            user.totalPost.push(post._id);
            await user.save();
        } else {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        await post.populate({ path: "author", select: "-password" });

        res.status(201).json({
            success: true,
            post,
            message: "Post Create Successuflly.",
        });
    } catch (error) {
        console.log(`Add New Post Error ${error}`);
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profileImg" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: {
                    path: "author",
                    select: "username profileImg",
                },
            });

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        console.log(`Get All Post Error ${error}`);
    }
};

export const getUserPost = async (req, res) => {
    try {
        const userId = req.id;

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "author",
                select: "username password",
            })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: {
                    path: "author",
                    select: "username profileImg",
                },
            });

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        console.log(`User Post Get Error ${error}`);
    }
};

// Post like Controller*****************************************************************
export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        if (!userId) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        if (!postId) {
            res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        // like post Logic
        // if user like any post push() the user id to Post like schema

        await post.updateOne({ $addToSet: { likes: userId } });
        await post.save();

        // implement Socket.io to realtime Notification
        // first find the user

        const user = await User.findById(userId).select("username profileImg");

        // yaha pr hum ye chek karange ki user agar khud ki post like kar raha hai to ouse notification show nahi karna hai
        // is ke liye hum jis post ko hum like karange ous ki ander se ous post ke author ki id nikal kar check karange

        const postOwnerId = post.author.toString();
        // check the user the post author user and the like karne wala user are same or not
        // agar dono user ki id alag hogi to he hum notification show karange

        if (postOwnerId !== userId) {
            // emit a notification event
            const notification = {
                type: "like",
                userId,
                postId,
                userDetails: user,
                message: "Your Post was Liked.",
            };
            // post ki owner ki socket id find karange taki hum ouse notification bhaj sake ki aap ki post pr like kiya hai
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit("notification", notification);
        }

        res.status(200).json({
            success: true,
            message: "Post Liked..!",
        });
    } catch (error) {
        console.log(`Like Post Error ${error}`);
    }
};

// Post DisLike Controller*****************************************************************
export const disLikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        if (!userId) {
            res.status(404).json({
                success: false,
                message: "User Id Not Found",
            });
        }

        if (!postId) {
            res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        // like post Logic
        // if user like any post push() the user id to Post like schema

        await post.updateOne({ $pull: { likes: userId } }); // this line go the the post schema and inside the like object/array and remove the user id
        await post.save();

        // implement Socket.io to realtime Notification
        // first find the user

        const user = await User.findById(userId).select("username profileImg");

        // yaha pr hum ye chek karange ki user agar khud ki post like kar raha hai to ouse notification show nahi karna hai
        // is ke liye hum jis post ko hum like karange ous ki ander se ous post ke author ki id nikal kar check karange

        const postOwnerId = post.author.toString();
        // check the user the post author user and the like karne wala user are same or not
        // agar dono user ki id alag hogi to he hum notification show karange

        if (postOwnerId !== userId) {
            // emit a notification event
            const notification = {
                type: "dislike",
                userId,
                postId,
                userDetails: user,
                message: "Your Post was Liked.",
            };
            // post ki owner ki socket id find karange taki hum ouse notification bhaj sake ki aap ki post pr like kiya hai
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit("notification", notification);
        }

        res.status(200).json({
            success: true,
            message: "Post Dislike..!",
        });
    } catch (error) {
        console.log(`DisLike Post Error ${error}`);
    }
};

// Add Comment Controller*****************************************************************

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        // get the comment text form the body
        const { commentText } = req.body;

        if (!commentText) {
            res.status(400).json({
                success: false,
                message: "Comment is Required...!",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        const comment = await Comment.create({
            text: commentText,
            author: userId,
            post: postId,
        });

        await comment.populate({
            path: "author",
            select: "username profilePicture",
        });

        post.comments.push(comment._id); // this line push the comment in the post schema inside the comments[] array
        await post.save();

        res.status(201).json({
            success: true,
            message: "Comment  Added Successfully",
            comment,
        });
    } catch (error) {}
};

// Get Comments for Each Posts Controller*****************************************************************

export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            res.status(404).json({
                success: false,
                message: "Post In Not Found",
            });
        }

        // this line check the id's inside the comments schema
        const comments = await Comment.find({ post: postId }).populate("author", "username", "profileImg");

        if (!comments) {
            res.status(404).json({
                success: false,
                message: "Comments Not Found",
            });
        }

        res.status(200).json({
            success: true,
            comments,
        });
    } catch (error) {
        console.log(`Cannot Get This Post Comments ${error}`);
    }
};

// Delete User Posts Controller*****************************************************************

export const deletePost = async (req, res) => {
    try {
        // which post you deleted get there post id
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post not Found",
            });
        }

        // check the logged in user the owner of the post

        if (post.author.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: "Unauthorized User",
            });
        }

        await Post.findByIdAndDelete(postId);

        // remove the delete posts form the user accounts

        let user = await User.findById(userId);
        user.totalPost = user.totalPost.filter((id) => id.toString() !== postId);
        await user.save();

        // remove comments form the deleted post

        await Comment.deleteMany({ post: postId });

        res.status(200).json({
            success: true,
            message: "Post Deleted",
        });
    } catch (error) {
        console.log(`cannot Delete the Post : ${error}`);
    }
};

// Saved Posts Controller*****************************************************************

export const savePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post Not found",
            });
        }

        const user = await User.findById(userId);
        if (user.savedPost.includes(post._id)) {
            // if the {user.savedPost.includes(post._id} condition is true its mean user alardy save this post so remove the post from saved

            await user.updateOne({ $pull: { savedPost: post._id } });
            await user.save();

            res.status(200).json({
                type: "unsaved",
                message: "Post removed from saved",
                success: true,
            });
        } else {
            // saved the post
            await user.updateOne({ $addToSet: { savedPost: post._id } });
            await user.save();

            res.status(200).json({
                type: "saved",
                message: "Post saved",
                success: true,
            });
        }
    } catch (error) {
        console.log(`cannot Saved this post : ${error}`);
    }
};
