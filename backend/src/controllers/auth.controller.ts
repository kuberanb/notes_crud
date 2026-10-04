import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { validateAuth } from "../validators/auth.validation.js";

export async function register(req: Request, res: Response) {
  const message = validateAuth(req.body, true);

  if (message) {
    res.status(400).json({
      status: false,
      message,
      data: null,
    });
    return;
  }

  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    const user = await authService.register(
      email.trim().toLowerCase(),
      password,
    );

    res.status(201).json({
      status: true,
      message: "Account created.",
      data: { user },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      res.status(409).json({
        status: false,
        message: "Email is already registered.",
        data: null,
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      status: false,
      message: "Could not create account.",
      data: null,
    });
  }
}

export async function login(req: Request, res: Response) {
  const message = validateAuth(req.body, false);

  if (message) {
    res.status(400).json({
      status: false,
      message,
      data: null,
    });
    return;
  }

  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    const result = await authService.login(
      email.trim().toLowerCase(),
      password,
    );

    if (!result) {
      res.status(401).json({
        status: false,
        message: "Invalid email or password.",
        data: null,
      });
      return;
    }

    res.json({
      status: true,
      message: "Logged in.",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: "Could not log in.",
      data: null,
    });
  }
}