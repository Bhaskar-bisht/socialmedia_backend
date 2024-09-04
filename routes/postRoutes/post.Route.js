/** @format */

import express from "express";
import {
    addComment,
    addNewPost,
    deletePost,
    disLikePost,
    getAllPost,
    getUserPost,
    likePost,
    savePost,
} from "../../controllers/userPostController/user.Post.Controller.js";
import userAuthentication from "../../middleware/userAuth.middleware.js";
import upload from "../../utils/Multer/multer.js";
const router = express.Router();

router.route("/addpost").post(userAuthentication, upload.single("postImage"), addNewPost);
router.route("/allpost").get(userAuthentication, getAllPost);
router.route("/userpost/all").get(userAuthentication, getUserPost);
router.route("/:id/like").get(userAuthentication, likePost);
router.route("/:id/dislike").get(userAuthentication, disLikePost);
router.route("/:id/comment").post(userAuthentication, addComment);
router.route("/delete/:id").delete(userAuthentication, deletePost);
router.route("/:id/saved").get(userAuthentication, savePost);

export default router;
