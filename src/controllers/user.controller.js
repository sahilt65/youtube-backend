import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {Subscription} from "../models/subscription.model.js";
import { uploadOnCloudinary } from '../utils/FileUpload.js';
import {ApiRespose} from "../utils/ApiResponse.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { generateAccessToken, genrateRefreshToken } from '../utils/genrateToken.js';

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        // console.log(user)
        const accessToken =  generateAccessToken(user);
        const refreshToken =  genrateRefreshToken(user);
        // console.log(accessToken);
        // console.log(refreshToken);
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while genrating access and refresh token");
    }

}


const registerUser = asyncHandler( async (req,res) => {
    /*
    -> get user detail from frontnd
    -> validation -not empty, email proper
    -> check if user already exist by username and email
    -> check for images and check for avtar
    -> upload them to cloudinary
    -> create user object- enter in the database
    -> check for user creation
    -> return the user
    */

    const {fullName, email, username, password}= req.body;

    if(
        [fullName,username,email,password].some( (field) => {
            field?.trim()==="";
        })
    ){
        throw new ApiError(400,"All fileds are required");
    }

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exits");
    }
    // console.log(req.files);

    const hashPassword = await bcrypt.hash(password,10);
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path;
    // console.log(avatarLocalPath);


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"avtar file is required from cluidnary");

    }
    

    const user = await User.create({
        fullName,
        username:username.toLowerCase(),
        email,
        password:hashPassword,
        avatar : avatar.url,
        coverImage :coverImage?.url || "" ,
        
         
    })
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    const option ={
        httpOnly:true,
        secure:true
    }
    return res.status(201)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiRespose(200,
            {
                user : createdUser,accessToken,refreshToken
            },"User Created Succesfully")
    )


}) 



const loginUser = asyncHandler(async (req,res)=>{
    // get the data from req.body
    // check using uername and email find the user in db
    // check the password
    // genrate the access and refresh token 
    // send with cokkie and response

    const {username,email,password} = req.body;
    // if(!username || !email){
    //     throw new ApiError(400,"username or email is required");
    // }

    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }
    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exit first register kindly");
    }
    // console.log(password);
    // console.log(user.password)

    // const isPasswordValid = await user.isPasswordCorrect(password);
    const isPasswordValid = await bcrypt.compare(password,user.password);
    // console.log(isPasswordValid)

    if(!isPasswordValid){
        throw new ApiError(401,"Invaild user crendinital");
    }

    // genrating access and refresh token and saving it to data base
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    const loginedUser = await User.findById(user._id).select("--password -refreshToken");

    const option ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiRespose(
            200,
            {
                user : loginedUser,accessToken,refreshToken
            },
            "User Logined Succesfully"
        )
    )

})


const logoutUser = asyncHandler(async(req,res)=>{
    // console.log(req.user);
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new : true
        }
    )

    const option ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiRespose(200,{},"User Logout Successfully")
    )
})


const refreshAccessToken = asyncHandler( async(req,res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken||
        req.body.refreshToken
    
        if(! incomingRefreshToken){
            throw new ApiError(401, "Unauthoried request ")
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(! user){
            throw new ApiError(421,"Invalid Refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const option ={
            httpOnly:true,
            secure:true
        }
        
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user?._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiRespose(
                200,
                {accessToken,refreshToken:newRefreshToken,option},
                "access token refresh"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invalid token")
    }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword ,newPassword} = req.body;
    if(oldPassword === newPassword){
        throw new ApiError(400,"oldPassword and newPassword should be diffrernt");
    }

    const user = await User.findById(req.user?._id);
    const isPasswordValid = await bcrypt.compare(oldPassword,user.password);
    // console.log(isPasswordValid)

    if(!isPasswordValid){
        throw new ApiError(401,"Invaild old Password");
    } 

    user.password = newPassword;
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiRespose(200,{},"password chnaged Succuesfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new  ApiRespose(200,req.user,"Current user fetched Successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body;
    if(!fullName || !email){
        throw new ApiError(400,"All field are required");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiRespose(
        200,user,"Accound detail updated successfully"
    ))
})


const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"File path is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400,"Error in getting avatar link from cloundniry")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar?.url
            }
        },
        {new : true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiRespose(200,user, " avatar file updated successfully")
    )
})


const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"File path is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(400,"Error in getting coverImage link from cloundniry")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage?.url
            }
        },
        {new : true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiRespose(200,user, " coverImage file updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;
    console.log(username)

    if(!username?.trim){
        throw new ApiError(400,"username is missing")
    }

    const channel  = await User.aggregate([
        {
            $match:{
                username :username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField: "_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField: "_id",
                foreignField:"subscriber",
                as:"subscribedTo" 
            }
        },
        {
            $addFields:{
                subscribersCount : {
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size : "$subscribedTo"
                },
                isSubscribed :{
                    $cond : {
                        if : {$in : [req.user?._id,"$subscribers.subscriber"]},
                        then : true,
                        else : false,
                    }
                }
            }
        },
        {
            $project :{
                fullName:1,
                email:1,
                username:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1
            }
        }
    ])


    // try to console log this channel
    if (!channel || !channel.length) {
        throw new ApiError(400, "Channel does not exist");
    }
    // console.log(channel)
    return res
    .status(200)
    .json(
        new ApiRespose(200,channel[0],"User Channel fetched successfully")
    )
})


const subscribeToChannel = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized user");
    }

  
    if (!username || !username.trim()) {
        throw new ApiError(400, "Username is missing");
    }


    const channel = await User.findOne({ username: username.toLowerCase() });
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channel._id,
        subscriber: req.user._id
    });
    if (existingSubscription) {
        throw new ApiError(400, "User is already subscribed to this channel");
    }

    const newSubscription = new Subscription({
        channel: channel._id,
        subscriber: req.user._id
    });
    await newSubscription.save();

    

    // Return success response
    return res
    .status(200)
    .json(new ApiRespose(200, null, "Subscribed to channel successfully"));
});


const unsubscribeFromChannel = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // Check if the user is authenticated
    if (!req.user) {
        throw new ApiError(401, "Unauthorized user");
    }

    // Check if the username is provided
    if (!username || !username.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    // Find the channel by username
    const channel = await User.findOne({ username: username.toLowerCase() });
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if the user is subscribed to the channel
    const subscription = await Subscription.findOneAndDelete({
        channel: channel._id,
        subscriber: req.user._id
    });
    if (!subscription) {
        throw new ApiError(400, "User is not subscribed to this channel");
    }

    // Decrement the subscriber count of the channel
    // await User.findByIdAndUpdate(channel._id, { $inc: { subscribersCount: -1 } });

    // Return success response
    return res.status(200).json(new ApiRespose(200, null, "Unsubscribed from channel successfully"));
});
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    subscribeToChannel,
    unsubscribeFromChannel
};

