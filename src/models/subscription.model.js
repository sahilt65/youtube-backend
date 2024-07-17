import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema ({

    subscriber : {
        type : Schema.Types.ObjectId,// jo subscribe krnr ahe 
        ref: "User"
    },
    channel : {
        type : Schema.Types.ObjectId, // jyala subscriber krnr ahe
        ref :"User"
    }

},{timestamps:true });


export const Subscription = mongoose.model("subscription",subscriptionSchema);