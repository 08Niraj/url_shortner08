import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return { accessToken, refreshToken };
};

export default generateTokens;