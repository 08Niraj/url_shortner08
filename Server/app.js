import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./src/config/db.js";
import authRouter from "./src/routers/auth.router.js";
import urlRouter from "./src/routers/url.router.js";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import path from "path"
import fs from 'fs'

const app=express();

//connecting the db
connectDB();


app.use(express.json())
app.use(cookieParser());

const accessLogStream = fs.createWriteStream(path.resolve('app.log'), { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));



//auth routes
app.use("/api/auth",authRouter);
app.use("/api/url",urlRouter)






app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})