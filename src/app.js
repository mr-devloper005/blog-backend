import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "https://yashblogeditor.netlify.app",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

import userRouter from "./routes/user.routes.js";

app.use("/api/auth", userRouter);

import blogRouter from "./routes/blog.routes.js";

app.use("/api", blogRouter);

// http://localhost:8000/api/savedraft

export default app;
