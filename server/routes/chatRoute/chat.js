import express from "express";
import {
  addMembers,
  sendAttachments,
  createGroupChat,
  getMyChats,
  getMyGroups,
  leaveGroups,
  removeMembers,
  chatDetails,
  renameGroup,
  deleteChat,
  getMessages,
} from "../../controllers/chatController/chat.js";
import { isAuthenticated } from "../../middlewares/auth.js";
import { attachmentsMulter } from "../../file/multer.js";

const router = express.Router();

router.route("/create-group-chat").post(isAuthenticated, createGroupChat);
//get my Chats
router.route("/my-chats").get(isAuthenticated, getMyChats);
router.route("/my-groups").get(isAuthenticated, getMyGroups);
router.route("/add-members").put(isAuthenticated, addMembers);
router.route("/remove-member").put(isAuthenticated, removeMembers);
router.route("/leave-group/:id").delete(isAuthenticated, leaveGroups);

//get Messages
router.get("/get-messages/:id", isAuthenticated, getMessages);

//add attachments
router
  .route("/send-attachments")
  .post(isAuthenticated, attachmentsMulter, sendAttachments);

//get Chat Details,Rename and Delete
router
  .route("/chat/:id")
  .get(isAuthenticated, chatDetails)
  .put(isAuthenticated, renameGroup)
  .delete(isAuthenticated, deleteChat);

export default router;
