import { Router } from "express";
import type { AuthRequest } from "../services/token.service.js";
import { getUserIdFromToken } from "../services/token.service.js";
import * as controller from "../controllers/note.controller.js";

export const noteRouter = Router();

noteRouter.use((req: AuthRequest, res, next) => {
  res.setHeader("Cache-Control", "no-store");

  const token = req
    .get("authorization")
    ?.match(/^Bearer ([^\s]+)$/i)?.[1];

  if (!token) {
    res.status(401).json({
      status: false,
      message: "Please log in.",
      data: null,
    });
    return;
  }

  try {
    req.userId = getUserIdFromToken(token);
  } catch {
    res.status(401).json({
      status: false,
      message: "Invalid or expired token.",
      data: null,
    });
    return;
  }

  next();
});

noteRouter.post("/", controller.create);
noteRouter.get("/", controller.list);
noteRouter.get("/:id", controller.get);
noteRouter.patch("/:id", controller.update);
noteRouter.delete("/:id", controller.remove);


