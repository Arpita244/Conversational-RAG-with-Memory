import express from "express";
import { purgeOldMessages } from "../controllers/maintenanceController.js";
const router = express.Router();
router.post("/purge", purgeOldMessages);
export default router;
