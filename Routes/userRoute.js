
import { Router } from "express";
import signup from "../Middlewares/userMiddleware.js";
import { login, forgotPassword, resetPassword } from "../Middlewares/userMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;