import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DB_URL = process.env.DB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const ARCJET_API_KEY = process.env.ARCJET_API_KEY;
export const ARCJET_ENV = process.env.ARCJET_ENV || "development";
