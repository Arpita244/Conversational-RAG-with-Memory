import { Router } from "express";
import { signup, login, me, logout } from "../controllers/profileController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authRequired, me);

export default router;
