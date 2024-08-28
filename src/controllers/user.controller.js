import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/apiResponse.js";




const registerUser = asyncHandler(async (req, res) => {
	const { fullName, email, userName, password } = req.body;

	if ([fullName, email, userName, password].some((field) => field.trim() === ""
	)) {
		throw new ApiError(400, "All Fields are Required");
	}

	const existedUser = User.findOne({
		$or: [{ userName }, { email }]
	})

	if (existedUser) {
		throw new ApiError(409, "User with email or username Already Exists.");
	}

	const avatarLocalPath = req.files?.avatar[0]?.path;

	const coverImageLocalPth = req.files?.coverImage[0]?.path;

	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar File is Required")
	}
	const avatar = await uploadOnCloudinary(avatarLocalPath);

	const coverImage = await uploadOnCloudinary(coverImageLocalPth);

	const user = await User.create({
		fullName: fullName,
		avatar: avatar.url,
		coverImage: coverImage?.url || "",
		email: email,
		password: password,
		userName: userName.toLowerCase()

	});

	const createdUser = await User.findById(user._id).select(" -password -refreshToken ");

	if (!createdUser) {
		throw new ApiError(500, "Something Went Wrong while registering the user");
	}

	return res.status(201).json(
		new ApiResponse(200, createdUser, "User registered Successfully")
	)

})

export { registerUser };