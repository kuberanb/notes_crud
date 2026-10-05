import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as controller from "../controllers/auth.controller.js"


export const authRouter = Router();


authRouter.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: "Too many attempts. Try again later.",
        data: null,
    },
})
);


authRouter.use((_req, res, next) => {

    res.setHeader("Cache-Control", "no-store")
    next()
})


authRouter.post("/register", controller.register)
authRouter.post("/login", controller.login)