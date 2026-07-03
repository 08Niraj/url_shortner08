import mongoose from "mongoose";

export async function connectDB(){
    try {
        console.log(process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully");
    }
    catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1)
    }
}