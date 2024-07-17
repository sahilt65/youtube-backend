import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    try {
        // console.log('Generating access token...');
        const accessToken = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );
        // console.log('Access token generated successfully:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error generating access token:', error);
        throw error; // Re-throw the error for further handling
    }
};

export const genrateRefreshToken = (user) => {

    try {
        // console.log('Generating refresh token...');
        const refreshToken = jwt.sign(
            {
                _id: user._id,
                
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );
        // console.log('Refresh token generated successfully:', refreshToken);
        return refreshToken;
    } catch (error) {
        console.error('Error generating refresh token:', error);
        throw error; // Re-throw the error for further handling
    
    }
    // return jwt.sign(
    //     {
    //         _id: user._id
    //     },
    //     process.env.REFRESH_TOKEN_SECRET,
    //     {
    //         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    //     }
    // );
};
