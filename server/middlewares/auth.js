import jwt from "jsonwebtoken";
import User from "../models/userModel/user.js";
import { tryCatchAsyncError } from "./tryCatchHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

//for all User
export const isAuthenticated = tryCatchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return next(new ErrorHandler("Authentication failed. Please log in.", 401));
  }

  let decodedData;
  try {
    decodedData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(
      new ErrorHandler("Invalid or expired token. Please log in again.", 401)
    );
  }

  const user = await User.findById(decodedData.id);
  if (!user) {
    return next(new ErrorHandler("No user found with this token.", 404));
  }

  req.user = user;
  next();
});

//for Admin
export const isAuthAdmin = tryCatchAsyncError(async (req, res, next) => {
  if (!req.user)
    return next(
      new ErrorHandler("you must be authenticate to access this resource", 401)
    );

  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not authorize to access this resource!`,
        403
      )
    );
  next();
});

// Refresh Token Controller
export const refreshToken = tryCatchAsyncError(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new ErrorHandler("No refresh Token", 401));

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return next(new ErrorHandler("Invalid refresh Token", 403));

    // Generate new access token
    const accessToken = user.generateAccessToken();
    res.json({ success: true, accessToken });
  });
});
