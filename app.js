import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";

import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errormiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use(errormiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API");
});

const startServer = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
