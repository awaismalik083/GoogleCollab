import { Router } from "express";
import signup from "../Controllers/userController.js";
import {
  login,
  forgotPassword,
  resetPassword,
  getMe,
} from "../Controllers/userController.js";
import { authMiddleware } from "../Utils/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", authMiddleware, getMe);

export default router;
