import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  tokenHash: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  deviceInfo: {
    type: String,
  },

  ipAddress: {
    type: String,
  },
},
{timestamps: true});

export default mongoose.model("RefreshToken", refreshTokenSchema);