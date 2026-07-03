import express from "express";
import {Router} from "express";
import {register} from "../controllers/authController.js";

const authRouter=Router();

authRouter.post("/login",register);