import {express,Router} from "express"
import {createShortUrl,getAllShortUrl,getShortUrl,deleteShortUrl,redirectToLongUrl} from  "../controllers/url.controller"

const urlRouter=Router();

urlRouter.post("/create",createShortUrl)
urlRouter.get("/getUrls",getAllShortUrl)
urlRouter.get("/getUrl",getShortUrl)
urlRouter.delete("/delete-url",deleteShortUrl)

urlRouter.redirect("/:shortUrl",redirectToLongUrl)



export default urlRouter;