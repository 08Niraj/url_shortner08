import User from "../models/user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req,res){
   try{
       const {name,email,password}=req.body;

       if(!name || !email || !password)
       {
         return res.status(400).json({message:"Please fill all the fields"});
       }
      
       if(password.length<6)
          return res.status(400).json({message:"Password must be at least 6 characters long"});

       const userExists=await User.findOne({email:req.body.email});
      
       if(userExists) {
         return res.status(400).json({message:"User already exists"});
       }

       const hashedPassword=await bcrypt.hash(password,10);

       const user=await User.create({
         name:name,
         email:email,
         password:hashedPassword
       });

       return res.status(201).json({message:"User registered successfully",user:user});

   }
   catch(error)
   {  
      console.log(error);
      return res.status(500).json({message:"Internal server error"});
      console.log(error);

   }
}

export async function login(req,res){
  const {email,password}=req.body;

  if(!email || !password){
    return res.status(400).json({message:"Please fill all the fields"});
  }

  const user= await User.findOne({email:email}).select("+password");

  if(!user){
    return res.status(400).json({message:"user not found"});
  }

  const isPasswordCorrect=await bcrypt.compare(password,user.password);

  if(!isPasswordCorrect){
    return res.status(400).json({message:"Invalid credentials"});
  }

  const refreshToken=jwt.sign({
     id:user._id,
  },process.env.JWT_TOKEN,{
    expiresIn:"1d"
  })

  const accessToken=jwt.sign({
     id:user._id,
  },process.env.JWT_TOKEN,{
    expiresIn:"15m"
  })

}