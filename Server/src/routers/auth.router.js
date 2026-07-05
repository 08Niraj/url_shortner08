import express from "express";
import {Router} from "express";
import {register,login,getMe,refreshTokenReNew,logout} from "../controllers/auth.controller.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const authRouter=Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.get("/protected",authMiddleware,getMe)
authRouter.post("/refresh",refreshTokenReNew)
authRouter.post("/logout",logout);
export default authRouter;