import express from "express";
import {
    generateInterViewReportController,
    getAllReport,
    getReportById
} from "../controllers/ai.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/").post(authenticateToken, singleUpload, generateInterViewReportController);
router.route("/").get(authenticateToken, getAllReport);
router.route("/report/:interviewId").get(authenticateToken, getReportById);

export default router;
