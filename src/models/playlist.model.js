import mongoose, { Schema, Types } from "mongoose";

const playlistSchema = new Schema(
	{
		name: {
			type: String,
			require: true
		},
		description: {
			type: String,
			require: true
		},
		Videos: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video"
			}
		],
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User"
		}

	},
	{ timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema)

