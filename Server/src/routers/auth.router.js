import express from "express";
import {Router} from "express";
import {register,login,getMe} from "../controllers/auth.controller.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const authRouter=Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.get("/protected",authMiddleware,getMe)

export default authRouter;