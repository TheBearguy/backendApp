import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiRresponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res) => {
    
    // 0. get user data from frontend
    // 1. middleware = for input validation (check if empty, check if user already exists (check by username and email))
    // check for images (avatar)
    // upload them to cloudinary - verify that images are finally uploaded

    // 2. create user object and push to db (db.create())
    // Do not pass password and refreshToken to the user = remove them from the response
    // check for user creation (if it is created successfullly)
    // 3. return response

    const { fullName, email, username, password } = req.body
    console.log(email);

    // if (fullName === "") {
    //     throw new ApiError(400, "Name is required")
    // }

    if (
        [fullName, email, username, password].some( (fields) => { return fields?.trim === ""})
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne(
        {
            $or: [
                    { username }, 
                    { email }
            ]
        }
    )
    console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User with that credentials already exists")
    }

    console.log(req.files?.avatar);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar needed ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar needed ")
    }

    const user = await User.create(
        {
            fullName, 
            avatar: avatar.url,
            email, 
            password, 
            coverImage: coverImage?.url || "",
            username: username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(
        new ApiRresponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}