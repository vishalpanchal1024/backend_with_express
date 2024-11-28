import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	Credential: true
}));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());



//routes Import

import userRouter from "./routes/user.routes.js";

// https://backend-1-41ot.onrender.com/api/v1/users/login

app.use("/api/v1/users", userRouter);

export { app };