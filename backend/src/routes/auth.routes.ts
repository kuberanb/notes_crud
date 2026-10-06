import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as controller from "../controllers/auth.controller.js"


export const authRouter = Router();

// Browser cookie requests must come from our frontend; Postman has no Origin.
authRouter.use((req, res, next) => {
    const origin = req.get("origin");
    if ((origin && origin !== process.env.WEB_ORIGIN) || req.get("sec-fetch-site") === "cross-site") {
        res.status(403).json({ status: false, message: "Origin not allowed.", data: null });
        return;
    }
    next();
});


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
authRouter.post("/refresh", controller.refresh)
authRouter.post("/logout", controller.logout)

