import express from 'express';
import { isAuthAdmin, isAuthenticated } from '../../middlewares/auth.js';
import { allAdminUsers, allChats, allMessages, getDashBoardStats } from '../../controllers/adminController/admin.js';
const router = express.Router();

//all users
router.route("/all-users").get(isAuthenticated,isAuthAdmin,allAdminUsers)
router.route("/all-chats").get(isAuthenticated,isAuthAdmin,allChats)
router.route("/all-messages").get(isAuthenticated,isAuthAdmin,allMessages)
router.route("/admin-stats").get(isAuthenticated,isAuthAdmin,getDashBoardStats)

export default router;