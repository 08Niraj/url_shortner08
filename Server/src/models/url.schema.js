import mongoose from "mongoose"

const urlSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

    originalUrl: {
        type: String,
        required: true
    },

    shortCode: {
        type: String,
        required: true,
        unique: true
    },

    clicks: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    

}, {
    timestamps: true
});

export default mongoose.model("Url",urlSchema)