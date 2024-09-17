import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";





const Options = {
	httpOnly: true,
	secure: true
};

const genratesRefreshAndAccessToken = async (userId) => {
	try {
		const user = await User.findById(userId);


		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();


		user.refreshToken = refreshToken;




		await user.save({ validateBeforeSave: false });


		return { accessToken, refreshToken };

	} catch (error) {
		throw new ApiError(500, "something went wrong while genrating Refresh And Access Token");

	}
}

const registerUser = asyncHandler(async (req, res) => {

	const { fullname, email, username, password } = req.body;

	if ([fullname, email, username, password].some((field) => field?.trim() === ""
	)) {
		throw new ApiError(400, "All Fields are Required");
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }]
	})

	if (existedUser) {
		throw new ApiError(409, "User with email or username Already Exists.");
	}

	const avatarLocalPath = req.files.avatar[0]?.path;


	const coverImageLocalPth = req.files.coverImage[0]?.path;


	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar File is Required")
	}
	const avatar = await uploadOnCloudinary(avatarLocalPath);

	const coverImage = await uploadOnCloudinary(coverImageLocalPth);

	const user = await User.create({
		fullname: fullname,
		avatar: avatar?.url,
		coverImage: coverImage?.url || "",
		email: email,
		password: password,
		username: username.toLowerCase()

	});

	const createdUser = await User.findById(user._id).select(" -password -refreshToken ");

	if (!createdUser) {
		throw new ApiError(500, "Something Went Wrong while registering the user");
	}

	return res.status(201).json(
		new ApiResponse(200, createdUser, "User registered Successfully")
	)

});

const loginUser = asyncHandler(async (req, res) => {

	const { email, username, password } = req.body;


	if (!(username || email)) {
		throw new ApiError(400, "Enter vaild Email or Username");

	}

	const user = await User.findOne({
		$or: [{ username }, { email }]
	})
	if (!user) {
		throw new ApiError(404, "User not Found");
	}
	const isPasswordCorrect = await user.isPasswordCorrect(password);

	if (!isPasswordCorrect) {
		throw new ApiError(400, "Invaild User Creadntials");
	}
	const { accessToken, refreshToken } = await genratesRefreshAndAccessToken(user._id);


	const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");

	return res.status(200).cookie("accessToken", accessToken, Options).cookie("refreshToken", refreshToken, Options).json(
		new ApiResponse(
			200,
			{
				user: loggedInUser, accessToken, refreshToken

			},
			"User LoggedIn Succesfully"
		)
	);



});

const logoutUser = asyncHandler(async (req, res) => {

	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: undefined
			},
		},
		{
			new: true
		}
	);

	return res.status(200).clearCookie("accessToken", Options).clearCookie("refreshToken", Options).json(new ApiResponse(200, {}, "User Log Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;


	if (!incomingRefreshToken) {
		throw new ApiError(401, "unauthorized Request");
	}

	try {
		const decordedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

		const user = await User.findById(decordedToken?._id);
		if (!user) {
			throw new ApiError(401, "Invalid RefreshToken");
		}


		if (incomingRefreshToken !== user?.refreshToken) {
			throw new ApiError(401, "Refresh token is Expired or used");
		}
		const { accessToken, refreshToken } = await genratesRefreshAndAccessToken(user._id);
		console.log(refreshToken);

		return res.status(200).cookie("accessToken", accessToken, Options).cookie("refreshToken", refreshToken, Options).json(
			new ApiResponse(200, {
				accessToken, refreshToken: refreshToken
			}, "Access Token refreshed"

			)
		)
	} catch (error) {
		throw new ApiError(401, error?.message || "Invaild refreshed token");
	}


});


export { registerUser, loginUser, logoutUser, refreshAccessToken };