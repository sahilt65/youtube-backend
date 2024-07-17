import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // console.log("I am in Cloudinary ", localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath);

        // console.log("File is uploaded on Cloudinary ", response);
        fs.unlinkSync(localFilePath); // syncronously remove the file from the folder
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        fs.unlinkSync(localFilePath);
        // Remove the locally saved file as the upload operation failed
        return null;
    }
};

export { uploadOnCloudinary };
