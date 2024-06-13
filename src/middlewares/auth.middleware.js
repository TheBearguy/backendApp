import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async (req, _, next) => { // if res is of no use , replace it with an "_"
    // const {accessToken} = req.cookies ||  req.header("authorization")?.replace("Bearer ", "")
    try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
            if (!token) {
                throw new ApiError(401, "Unauthorised request")
            }
        
            const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
            // now we have decoded data (info ) of the user (its an object)
            const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken")
        
            if(!user) {
                // Frontend related
                throw new ApiError(401, "Invalid token")
            }
        
            req.user = user;
            next()
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})   