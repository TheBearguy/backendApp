import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, // the frontend server
    credentials: true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public")) // some assets that i want to save on the server itself
app.use(cookieParser())

//routes import

import userRouter from './routes/user.routes.js'
import videoRoutes from "./routes/video.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import likeRoutes from "./routes/like.routes.js"
// routes declaration
// url variable
app.use("/api/v1/users", userRouter)
app.use("/api/v1/users", videoRoutes)
app.use("api/v1/users", commentRoutes)
app.use("api/v1/users", likeRoutes)

// http://localhost:8000/api/v1/users/register

export { app }