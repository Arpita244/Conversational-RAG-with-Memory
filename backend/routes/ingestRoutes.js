import express from "express";
import { ingestText } from "../controllers/ingestController.js";
const router = express.Router();
router.post("/", ingestText);
export default router;
