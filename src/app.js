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

export { app }