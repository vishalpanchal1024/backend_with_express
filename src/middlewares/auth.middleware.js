import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";



export const verifyJwtToken = asyncHandler(async (req, _, next) => {

	try {
		const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
		
		if (!token) {
			throw new ApiError(500, "Unauthorized Request");
		}
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findById(decodedToken).select("-password -refreshToken");
		if (!user) {
			throw new ApiError(401, "Invaild Access Token");

		}
		req.user = user;

		next();
	} catch (error) {
		throw new ApiError(400, error.message || "Invaild  Access Token")
	}
})