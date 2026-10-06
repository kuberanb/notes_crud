import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { noteRouter } from "./routes/note.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "512kb" }));

app.get("/", (_req, res) => {
  res.json({
    status: true,
    message: "Notes API is running.",
    data: null,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);

app.use((_req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint not found.",
    data: null,
  });
});

const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode =
    error?.type === "entity.parse.failed" ? 400 :
    error?.type === "entity.too.large" ? 413 : 500;

  const message =
    statusCode === 400 ? "Invalid JSON." :
    statusCode === 413 ? "Request body is too large." :
    "An unexpected error occurred.";

  if (statusCode === 500) console.error(error);

  res.status(statusCode).json({
    status: false,
    message,
    data: null,
  });
};

app.use(handleError);

export default app;
