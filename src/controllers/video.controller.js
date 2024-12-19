import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


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
	const { videoId } = req.params;
	//TODO: get video by id
	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invaild video ID");
	}
	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(400, "No video found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, "Video fatch succsessfully"));


})

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	//TODO: update video details like title, description, thumbnail

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invaild video ID")
	}

	const { title, description } = req.body;

	if (!(title && description)) {
		throw new ApiError(400, "both fields are required")
	}

	const newThumbnailLocalPath = req.file?.path;

	if (!newThumbnailLocalPath) {
		throw new ApiError(400, "upload thumbnail ");
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, "video not found ");
	}

	if (video.owner.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You are not allowed to update this video");
	}

	// if (!video.owner.equals(req.user?._id)) {
	// 	console.log("8456789876556789876567899874567898765679879", video.owner)
	// 	console.log("8456789876556789876567899874567898765679879", req.user._id)
	// 	throw new ApiError(400, " Permission Denied ! ");
	// }

	const oldThumbnailDelete = await deleteFromCloudinary(video.thumbnail);
	console.log("****************", oldThumbnailDelete);
	if (oldThumbnailDelete.result !== "ok") {
		throw new ApiError(400, " error while deleting old thumbnail ");
	}



	const thumbnail = await uploadOnCloudinary(newThumbnailLocalPath);

	if (!thumbnail.url) {
		throw new ApiError(400, " error while uploading thumbnail on cloudinary");
	}
	const updatedVideo = await Video.findByIdAndUpdate(videoId, {
		$set: {
			title,
			description,
			thumbnail: thumbnail.url
		}

	}, { new: true })


	if (!video) {
		throw new ApiError(400, "upload thumbnail ");
	}
	return res.status(200).json(new ApiResponse(201, video, "update succsessfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	//TODO: delete video

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invaild video ID");
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, "video not found");
	}

	if (video.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, "permission denied");
	}

	const videoFileDelete = await deleteFromCloudinary(video?.videoFile, "video");

	console.log(videoFileDelete);

	if (videoFileDelete.result !== "ok") {
		throw new ApiError(500, " error while deleting video from clouninary ");
	}


	const thumbnailDelete = await deleteFromCloudinary(video?.thumbnail);

	console.log(thumbnailDelete);

	if (thumbnailDelete.result !== "ok") {
		throw new ApiError(500, "error while deleting thumbnail from clouninary");
	}


	const deleteVideo = await Video.findOneAndDelete(videoId);

	if (!deleteVideo) {
		throw new ApiError(404, "video not delete");
	}


	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Video delete succsessfully."));


})

const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, "Invaild video ID");
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, "video not found");
	}

	if (video.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, "permission denied");
	}
	const updatedPublishedStatus = await Video.findByIdAndUpdate(videoId, {
		$set: {

			isPublished: !video.isPublished
		}

	}, { new: true })

	return res
		.status(200)
		.json(new ApiResponse(200, updatedPublishedStatus, "video published status change succsessfully"));
})

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus
}