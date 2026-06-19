import express from "express";
import {
    generateInterViewReportController,
    getAllReport,
    getReportById
} from "../controllers/ai.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { validateAiInput } from "../middleware/validateAiInput.js";

const router = express.Router();

router.route("/").post(authenticateToken, aiLimiter, singleUpload, validateAiInput, generateInterViewReportController);
router.route("/").get(authenticateToken, aiLimiter, getAllReport);
router.route("/report/:interviewId").get(authenticateToken, aiLimiter, getReportById);

export default router;

