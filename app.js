import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";

import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errormiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(arcjetMiddleware);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflow", workflowRouter);
app.use(errormiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API");
});

const startServer = async () => {
  await connectToDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free the port and try again.`);
      process.exit(1);
    }
    throw err;
  });
};

startServer();

export default app;
