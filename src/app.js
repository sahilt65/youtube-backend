import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit :"16kb"}));
app.use(express.static("publlic"));
app.use(cookieParser());


// routes import
import router from "./routes/user.routes.js";
// routes declration
app.use("/api/v1/users",router);
export  {app};