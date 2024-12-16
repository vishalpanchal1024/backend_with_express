import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
	//TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body
	// TODO: get video, upload to cloudinary, create video

	if (!(title && description)) {
		throw new ApiError(400, "enter title and description");

	}

	const videoLocalPath = req.files?.videoFile[0]?.path;

	if (!videoLocalPath) {
		throw new ApiError(400, "video file not upload");
	}

	const videoFile = await uploadOnCloudinary(videoLocalPath);

	if (!videoFile.url) {
		throw new ApiError(400, "Error while uploding on cloudnary");
	}

	const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

	if (!thumbnailLocalPath) {
		throw new ApiError(400, "thumbnail not upload");
	}

	const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

	if (!thumbnail.url) {
		throw new ApiError(400, "Error while uploding on cloudnary");
	}



	const video = await Video.create({
		title,
		description,
		videoFile: videoFile.url,
		duration: videoFile.duration,
		thumbnail: thumbnail.url,
		owner: req.user._id
	})
	if (!video) {
		throw new ApiError(400, "error while uploading video");
	}

	console.log("heroooooooooooooo", video)
	return res
		.status(200)
		.json(new ApiResponse(200, video, "Video published succsessfully"))

	// return res.status(201).json(
	// 	new ApiResponse(200, video, "User registered Successfully")
	// )

})

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	//TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	//TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	//TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params
})

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus
}