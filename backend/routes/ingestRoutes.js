import { Router } from "express";
import { ingestText } from "../controllers/ingestController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.post("/", authRequired, ingestText);

export default router;
