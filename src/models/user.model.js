import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema
({
    username :
    {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
    },
    email :
    {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullName :
    {
        type : String,
        required : true,
        trim : true,
        index : true,
    },
    avatar :
    {
        type : String, // cloudinary url
        required : true,
    },
    coverImage :
    {
        type : String, // cloudinary url
    },
    watchHistory :
    [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password :
    {
        type : String,
        required : [true, "Password is required"]
    },
    refreshToken :
    {
        type : String
    }
},
{
    timestamps: true
})


// userSchema.pre("save", async function(next) {
//     // password should hash only when there is a change in password
//     if (this.isModified("password")) {
//         try {
//             this.password = await bcrypt.hash(this.password, 10);
//             next();
//         } catch (error) {
//             next(error); // Pass the error to the next middleware
//         }
//     } else {
//         next(); // Move to the next middleware if password is not modified
//     }
// });

// userSchema.methods.isPasswordCorrect = async function(password) {
//     try {
//         return await bcrypt.compare(password, this.password);
//     } catch (error) {
//         // Handle the error, you can log it or return false depending on your application's requirements
//         console.error("Error comparing passwords:", error);
//         return false; // Return false indicating password comparison failure
//     }
// }


// userSchema.methods.genrateAccessToken = function(){
//     jwt.sign(
//         {
//         _id : this._id,
//         email : this.email,
//         username : this.username,
//         fullName : this.fullName
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn : process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )

// }
// userSchema.methods.genrateRefreshToken = function()
// {
//     jwt.sign(
//         {
//         _id : this._id,
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn : process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }


export const User = mongoose.model("User",userSchema);