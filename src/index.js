import 'dotenv/config'
import connectDB from "./db/db.js";
import { app } from './app.js';



connectDB()
.then( () => {
    app.listen(process.env.PORT || 5000 , () => {
        console.log(`server is running on port : ${process.env.PORT}`);
    })
})
.catch( (error) => {
    console.log("error coming from index.js file.\nMongoDB conection failed ::: ",error);
})

















/*
import express from "express";

const app = express();
( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`)
        app.on("eroor",(error)=>{
            console.log("Error in app: ",error);
            throw error
        })

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("error: ",error);
        throw error
    }
})()
*/