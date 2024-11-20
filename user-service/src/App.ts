import express from "express";
import { config }  from "./configs/config";
import userRouter from "./api/routes/UserRoutes";

const app = express();
const port = config.port;

// Middleware
app.use(express.json());

// Routes
app.use("/users", userRouter);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});