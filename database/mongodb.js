import mongoose from "mongoose";
import { DB_URL,NODE_ENV } from "../config/env.js";
import e from "express";
if(!DB_URL){
  throw new Error('DB_URL is not defined in environment variables inside .env<development/production>.local file');
}
const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URL);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }
}
 export default connectToDatabase;