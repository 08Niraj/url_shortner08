import jwt from "jsonwebtoken";
export const authMiddleware=async(req,res,next)=>{
 try{
    const token=req.headers.authorization?.split(" ")[1];

    if(!token)
        return res.status(401).json({message:"Unauthorized"});

   
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        console.log(decoded)
        next();
    }
    catch(error)
    {
        console.log(error);
        return res.status(401).json({message:"Unauthorized"});
    }


}

