import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { redis } from "../config/upstash.js";

const authorize = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.userId;
        req.userRole = decoded.role || "user";
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

export const authorizeAdmin = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ success: false, error: "Admin access required" });
    }
    next();
};

export default authorize;