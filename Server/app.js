import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./src/config/db.js";
import authRouter from "./src/routers/auth.router.js";
import cookieParser from "cookie-parser";

//connecting the db
connectDB();


app.use(express.json())
app.use(cookieParser());

//auth routes
app.use("api/auth",authRouter);



const app=express();


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})