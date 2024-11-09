import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	changeCurrentPassword,
	getCurrentUser,
	updateAccountDetails,
	updateUserAvatar,
	updateUserCoverImage,
	getUserChannelProfile,
	getUserWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{
	name: "avatar",
	maxCount: 1
},
{
	name: "coverImage",
	maxCount: 1
}]), registerUser)

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwtToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwtToken, changeCurrentPassword);
router.route("/current-user").get(verifyJwtToken, getCurrentUser);
router.route("/update-account").patch(verifyJwtToken, updateAccountDetails);
router.route("/update-avatar").patch(verifyJwtToken, upload.single("avatar"), updateUserAvatar);
router.route("/update-avatar").patch(verifyJwtToken, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJwtToken, getUserChannelProfile);
router.route("/watch-history").get(verifyJwtToken, getUserWatchHistory);



export default router;