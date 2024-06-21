// require('dotenv').config({path: "./env"})
import dotenv from "dotenv"

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.on('error', (error) => {
        console.log("ERR: ", error);
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=> {
    console.log(`MongoDB connection failed, ${err}`);
})