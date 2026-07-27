import express from "express";
const router = express.Router();
import { sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

// POST /api/chat
// "protect" ensures req.user is the logged-in user (from your existing authMiddleware.js)
router.route("/").post(protect, sendMessage);

export default router;
