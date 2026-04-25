import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DB_URL = process.env.DB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const ARCJET_API_KEY = process.env.ARCJET_API_KEY;
export const ARCJET_ENV = process.env.ARCJET_ENV || "development";
export const SERVER_URL = process.env.SERVER_URL;
export const QSTASH_URL = process.env.QSTASH_URL;
export const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
export const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY;
export const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
