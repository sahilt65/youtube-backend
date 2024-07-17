import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log(`\n MongoDB Connected Successfully \n DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("error from db.js file \n Error in MongoDB : ",error);
        process.exit(1);
    }
}

export default connectDB