import express from "express";
import {
  acceptFriendRequest,
  changePassword,
  deleteProfile,
  followUser,
  forgotPassword,
  getMyFriends,
  getMyNotifications,
  getProfile,
  login,
  logout,
  register,
  resendOTP,
  resetOTPRecovery,
  resetPassword,
  searchUser,
  sendFriendRequest,
  updateProfile,
  userPosts,
  verifyAccount,
} from "../../controllers/userController/user.js";
import { isAuthAdmin, isAuthenticated, refreshToken } from "../../middlewares/auth.js";
import { singleAvatar } from "../../file/multer.js";


const router = express.Router();

//register
router.route("/register").post(register);
router.route("/verify-account").post(verifyAccount);
router.route("/resend-otp").post(resendOTP);
router.route("/login").post(login);

router.get("/refresh-token", refreshToken);
router.post("/logout", logout);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/reset-verify-OTP-account").post(resetOTPRecovery);


//isAuthenticated
router.route("/change-password").put(isAuthenticated, changePassword);
router
  .route("/update-profile")
  .put(isAuthenticated, singleAvatar, updateProfile);

router.route("/me").get(isAuthenticated, getProfile);
router.route("/search-user").get(isAuthenticated, searchUser);
router.route("/send-friend-request").put(isAuthenticated, sendFriendRequest);
router.route("/accept-friend-request").put(isAuthenticated, acceptFriendRequest);
router.route("/notifications").get(isAuthenticated, getMyNotifications);
router.route("/my-friends").get(isAuthenticated,getMyFriends);
router.route("delete-user").delete(isAuthenticated,isAuthAdmin,deleteProfile)

//user follow
router.route("/follow/:id").get(isAuthenticated,followUser)
//user-posts
router.route("/user-posts/:id").get(isAuthenticated,userPosts)

export default router;
