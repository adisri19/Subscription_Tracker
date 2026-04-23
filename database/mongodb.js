import mongoose from "mongoose";
import { DB_URL } from "../config/env.js";

if (!DB_URL) {
  throw new Error(
    "DB_URL is not defined in environment variables inside .env<development/production>.local file"
  );
}

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(DB_URL);
    console.log(`MongoDB connected: ${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
