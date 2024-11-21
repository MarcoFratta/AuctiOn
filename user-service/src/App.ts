import express from "express";
import userRouter from "./api/routes/UserRoutes";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/users", userRouter);

export default app