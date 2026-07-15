import express from "express"
import {Router} from "express"
import {createShortUrl,getAllShortUrl,deleteShortUrl,redirectToLongUrl} from  "../controllers/url.controller.js"
import {authMiddleware} from "../middleware/authMiddleware.js"

const urlRouter=Router();

urlRouter.post("/create",authMiddleware,createShortUrl)
urlRouter.get("/geturls",authMiddleware,getAllShortUrl)

urlRouter.delete("/delete-url",authMiddleware,deleteShortUrl)

urlRouter.get("/:shortCode",redirectToLongUrl)



export default urlRouter;