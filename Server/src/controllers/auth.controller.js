import User from "../models/user.schema.js";
import bcrypt from "bcrypt";
import refreshTokenModel from "../models/refresh.schema.js";
import hashToken from "../utils/hashTokens.js";
import generateTokens from "../utils/generateTokens.js";
import setCookie from "../utils/setCookies.js";
import jwt from "jsonwebtoken";


export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

      

        return res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("[Register Error]:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id);
        const hashedRefreshToken =await hashToken(refreshToken);

        await refreshTokenModel.create({
            user: user._id,
            tokenHash: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip
        });

        await setCookie(res, refreshToken);

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            accessToken,
            user: userResponse
        });

    } catch (error) {
        console.error("[Login Error]:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMe(req, res) {
    // Note: This assumes you have an auth middleware that sets req.user
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ user: req.user });
}

export const refreshTokenReNew = async (req, res) => {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        if (!currentRefreshToken) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Clear the cookie preemptively in case of failure
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        console.log(currentRefreshToken)
        let decoded;
        try {
            decoded = jwt.verify(currentRefreshToken, process.env.JWT_SECRET);
        } catch (err) {
            // Add this log to see the real error
            
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const currentHash = hashToken(currentRefreshToken);
        
        // Find and delete the token in one atomic operation
        const storedToken = await refreshTokenModel.findOneAndDelete({ tokenHash: currentHash });

        // TOKEN THEFT DETECTION
        // If the token is valid (JWT verified) but NOT in the database, it means
        // the token was already used. A malicious actor might have compromised it.
        // Action: Invalidate ALL refresh tokens for this user.
        if (!storedToken) {
            console.warn(`[Security Alert] Reused refresh token detected for user: ${decoded.id}`);
            await refreshTokenModel.deleteMany({ user: decoded.id });
            return res.status(401).json({ message: "Security breach detected. Please log in again." });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // Generate new token family
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        const newHash = hashToken(newRefreshToken);

        await refreshTokenModel.create({
            user: user._id,
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip
        });

        setCookie(res, newRefreshToken);

        return res.status(200).json({ accessToken });

    } catch (error) {
        console.error("[Refresh Token Error]:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        // If no token exists, they are already logged out
        if (!currentRefreshToken) {
            return res.status(204).json({ message: "No active session found" }); 
            // Note: 204 means "No Content" (request successful, but nothing to return). 
            // You could also use 401 Unauthorized or 400 Bad Request, though 204 or 200 is preferred.
        }

        // If token exists, hash and delete it
        const currentHash = hashToken(currentRefreshToken);
        await refreshTokenModel.findOneAndDelete({ tokenHash: currentHash });

        // Clear the cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("[Logout Error]:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};