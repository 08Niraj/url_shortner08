import { createHmac } from "crypto";
const hashToken = (token) => {
    return createHmac('sha256', process.env.JWT_SECRET).update(token).digest('hex');
};


export default hashToken;