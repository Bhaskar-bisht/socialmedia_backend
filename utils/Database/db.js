/** @format */

import mongoose from "mongoose";

const connectDB = async (mongoURI) => {
    try {
        await mongoose
            .connect(mongoURI)
            .then((res) => {
                console.log(`Your MongoDB Database Is Connected Successfully at : ${mongoose.connection.host}`);
            })
            .catch((err) => console.log(`Mongoose Connection Error : ${err}`));
    } catch (error) {
        console.log(`Mongoose Connection Error : ${error}`);
    }
};

export default connectDB;
