/** @format */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Post from "../../models/post.Model.js";
import User from "../../models/user.Model.js";
import cloudinary from "../../utils/Cloudinary/cloudinary.js";
import getDataUri from "../../utils/ImageURI/datauri.js";

export const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!(username && password && email)) {
            res.status(403).json({
                success: false,
                message: "All Fields are Required",
            });
        }

        // check The Email Alardy Register in Database or not
        const user = await User.findOne({ email });
        if (user) {
            res.status(409).json({
                success: false,
                message: "User Alredy Exiting",
            });
        }

        // encrypted Password & then Save the Database
        const hashPassword = await bcrypt.hash(password, 15);

        // if User not find create a new User in Database
        await User.create({
            username,
            password: hashPassword,
            email,
        });

        res.status(201).json({
            success: true,
            message: `Welcome ${username} to Your New Account`,
        });
    } catch (error) {
        console.log(error);
    }
};

// Login Controller *************************************************************

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // check the username or password is send or not

        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: "All Fields Are Required",
            });
        }
        // if user send the username or password then check the username or password is vaild or not

        let user = await User.findOne({
            username,
        });

        // check the user is not find in database
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        // compare the encrypted Password
        // NOTE: => the {password} is comes to frontend and the {"user.password" => this is a encrypted} is comes to database
        const isCamparePassword = await bcrypt.compare(password, user.password);

        if (!isCamparePassword) {
            res.status(401).json({
                success: false,
                message: "Please Enter a Valid Email & Password",
            });
        }

        /*  if there is ok So then genrate a Token and send to the user so user can Login successfully
        genrate token using jwt token and sign() method
        NOTE: => {user: user._id} this code is store user id Comming from database
        NOTE: => {process.env.SECRATE_KEY} this code is encrypte our token
        NOTE: => {{expiresIn: '1d'}} this code tell the how many days the token is expire
    */

        const token = await jwt.sign({ userId: user._id }, process.env.SECRATE_KEY, {
            expiresIn: "1d",
        });

        // if user logged in then show the users all post but the user post schema store only post ID then the bases of Post id find the all details about the post
        // i use Promise.all because i use map method inside the posts because the post is a Array
        const populatedPost = await Promise.all(
            user.totalPost.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post?.author.equals(user._id)) {
                    return post;
                } else {
                    return null;
                }
            })
        );

        // if the user is login then send the user all details like {username, email, follower, following, profileImg} or etc.
        // return the user from response
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImg: user.profileImg,
            bio: user.bio,
            gender: user.gender,
            follower: user.follower,
            following: user.following,
            post: populatedPost,
            savedPost: user.savedPost,
        };

        return res
            .cookie("Social_Media_Token", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: true, // Set this to true for HTTPS

                maxAge: 1 * 24 * 60 * 60 * 1000,
            })
            .json({
                success: true,
                message: `Welcome Back ${username}`,
                user,
            });
    } catch (error) {
        console.log(`User Login Error : ${error}`);
    }
};

// Logout Controller *************************************************************

export const logoutUser = async (req, res) => {
    try {
        // if user logout so delete the user Token stored in cookie
        res.cookie("Social_Media_Token", "", { maxAge: 0 }).json({
            success: true,
            message: "User Logout Successfully..!",
        });
    } catch (error) {
        console.log(`User Logout Error : ${error}`);
    }
};

// Get UserProfile Controller *************************************************************

export const userProfile = async (req, res) => {
    // first get the user id which user is see profile
    try {
        const userId = req.params.id;
        // console.log("userId", userId);

        if (!userId) {
            res.status(404).json({
                success: false,
                message: "Invalid User..",
            });
        }

        const user = await User.findById(userId)
            .select("-password")
            .populate({ path: "totalPost", createdAt: -1 })
            .populate("savedPost");
        // .populate("follower")
        // .populate("following");

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Profile Not Found..",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(`Cannot get User Profile : ${error}`);
    }
};

// Update The UserProfile Controller *************************************************************

export const updateUserProfile = async (req, res) => {
    try {
        // How can i check the user is login or not.? => Using Middleware I check the User is login or not using User token
        const userId = req.id;
        // check the user is valid or not
        // which valuse user can updates
        const { bio, gender, username } = req.body;
        const profileImg = req.file;

        // Check if the new username already exists
        const existingUser = await User.findOne({ username });

        // If username exists and it's not the current user's username
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: "Username already Taken.",
            });
        }

        let cloudinaryResponse;

        if (profileImg) {
            const fileUri = getDataUri(profileImg);
            // console.log("fileUri is :", fileUri);
            // save the image in cloudinary and get the image link
            // cloudinaryResponse = await cloudinary.uploader.upload(fileUri);
            cloudinaryResponse = await cloudinary.uploader.upload(fileUri);
        }
        // if (!cloudinaryResponse) {
        //     res.status(400).json({
        //         success: false,
        //         message: "File Uploading Error",
        //     });
        // }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // update the user Details according

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (username) user.username = username;
        if (profileImg) user.profileImg = cloudinaryResponse.secure_url;

        // then all ok To save the user

        await user.save();

        res.status(200).json({
            success: true,
            message: `Greetings ${user.username} Your Profile Updated Successfully `,
            user,
        });
    } catch (error) {
        console.log(`cannot Update userprofile : ${error}`);
    }
};

// Suggested User Controller *************************************************************

export const getSuggestedUser = async (req, res) => {
    try {
        // Suggested all database Users
        // .select("-password") its means the  user is not return password  of Any User
        const suggestedUser = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUser) {
            res.status(500).json({
                message: " Currently Do not have any Suggested User",
            });
        }

        res.status(200).json({
            success: true,
            users: suggestedUser,
        });
    } catch (error) {
        console.log(`Suggested User Not Found : ${error}`);
    }
};

// Follow and Unfollow User Controller *************************************************************

export const followAndUnfollow = async (req, res) => {
    try {
        //
        const userWhoFollow = req.id;
        const userToFollow = req.params.id;

        if (userWhoFollow === userToFollow) {
            // check the userWhoFollow & userToFollow id iss same or not
            res.status(400).json({
                success: true,
                message: "You cannot Follow or Unfollow Your Self",
            });
        }

        const user = await User.findById(userWhoFollow); // get the user in database
        const targetUser = await User.findById(userToFollow);

        if (!user || !targetUser) {
            res.status(400).json({
                success: false,
                message: "User not found to Follow and Unfollow",
            });
        }

        // create the following or unfollowing logic

        const isFollowing = user.following.includes(userToFollow); // it's mean check the user alardy following me or not

        if (isFollowing) {
            // if user following me then show unfollow to the user
            await Promise.all([
                await User.updateOne({ _id: userWhoFollow }, { $pull: { following: userToFollow } }),
                await User.updateOne({ _id: userToFollow }, { $pull: { follower: userWhoFollow } }),
            ]);

            res.status(200).json({
                success: true,
                message: "User Unfollow Successfully",
            });
        } else {
            // if user not follow me then show follow me to the user
            await Promise.all([
                await User.updateOne({ _id: userWhoFollow }, { $push: { following: userToFollow } }),
                await User.updateOne({ _id: userToFollow }, { $push: { follower: userWhoFollow } }),
            ]);

            res.status(200).json({
                success: true,
                message: "User Follow Successfully",
            });
        }
    } catch (error) {
        console.log(`User Follow and Unfollow Error : ${error}`);
    }
};
