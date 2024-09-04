/** @format */

import express from "express";
import { getAllMessage, sendMessage } from "../../controllers/userMessageController/message.Controller.js";
import userAuthentication from "../../middleware/userAuth.middleware.js";
const router = express.Router();

router.route("/send/:id").post(userAuthentication, sendMessage);
router.route("/all/:id").get(userAuthentication, getAllMessage);

export default router;
