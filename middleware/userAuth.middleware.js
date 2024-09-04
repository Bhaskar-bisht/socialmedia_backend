/** @format */

import jwt from "jsonwebtoken";

// this middleware check the user is loggedIn or not Using user Token and the token store in Frontend cookie
const userAuthentication = async (req, res, next) => {
    try {
        // get the token which stored in cookie in frontend

        const token = req.cookies.Social_Media_Token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "User Not Login..!",
            });
        }

        // if the token is get then check the Token is valid or not

        const varifiedToken = await jwt.verify(token, process.env.SECRATE_KEY);

        if (!varifiedToken) {
            res.statue(401).json({
                success: false,
                message: "User Token is Not Valid.",
            });
        }

        // if all is ok then send the userId to req.id
        // and the req.id i can access in our profileUpdate Controller
        // {varifiedToken.userId} This user id i send in backend if the user is login.
        req.id = varifiedToken.userId;
        next();
    } catch (error) {
        console.log(`User Authentication Error : ${error}`);
    }
};

export default userAuthentication;
