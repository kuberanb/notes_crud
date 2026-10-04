
import type { Request } from "express";

import jwt from "jsonwebtoken"
import { env } from "../config/env.js";

export type AuthRequest = Request & {
    userId?: number;
}

export function createToken(userId: number): string {
    return jwt.sign({}, env.JWT_SECRET, {
        algorithm: "HS256",
        subject: String(userId),
        issuer: "notes-api",
        audience: "notes-api",
        expiresIn: "15m",
    })

}

export function getUserIdFromToken(token: string): number {

    const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "notes-api",
        audience: "notes-api",
    })

    if (payload === "string" || typeof payload.sub !== "string" || !/^[1-9]\d*$/.test(payload.sub)) {

        throw new Error("Invalid token.");

    }

    const userId = Number(payload.sub)

    if (!Number.isSafeInteger(userId) || userId > 2147483647) {
        throw new Error("Invalid user Id")
    }

    return userId;

}





