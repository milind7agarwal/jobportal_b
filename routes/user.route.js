import express from "express";

const router = express.Router();

import { register, login, logout, updateProfile } from "../controllers/user.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";


router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile/update").post(authenticateToken,singleUpload, updateProfile);


export default router;