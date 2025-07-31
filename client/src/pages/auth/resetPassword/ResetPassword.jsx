import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  clearAuthError,
  resetPassword,
} from "../../../redux/features/auth/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { isLoading, error, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [resetPasswordErr, setResetPasswordErr] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const validatedForm = () => {
    let newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = "New Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setResetPasswordErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatedForm()) {
      const resetData = {
        userId: user._id,
        newPassword,
        confirmPassword,
      };
      dispatch(resetPassword({ resetData, toast, navigate }));
    } else {
      toast.warn("Please fill out the form correctly!");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);
  return (
    <div>
      <div className="font-roboto flex h-screen justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 font-roboto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-roboto">
            Reset Your Password?
          </h2>

          <form onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-500 mb-2"
                htmlFor="newPassword"
              >
                New Password*
              </label>
              <div className="relative w-full">
                <input
                  className="appearance-none text-sm font-gothamNarrow block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4 leading-tight focus:outline-none focus:border-blue-600"
                  id="password"
                  name="newPassword"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {resetPasswordErr.newPassword && (
                  <p className="text-red-500 text-xs">
                    {resetPasswordErr.newPassword}
                  </p>
                )}
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <FaEyeSlash className="text-neutral-600" />
                  ) : (
                    <FaEye className="text-neutral-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-500 mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password*
              </label>
              <div className="relative w-full">
                <input
                  className="appearance-none text-sm font-gothamNarrow block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4 leading-tight focus:outline-none focus:border-blue-600"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {resetPasswordErr.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {resetPasswordErr.confirmPassword}
                  </p>
                )}
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? (
                    <FaEyeSlash className="text-neutral-600" />
                  ) : (
                    <FaEye className="text-neutral-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full font-roboto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              {isLoading && (
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                </span>
              )}
              Submit
            </button>
          </form>

          <hr className="my-6 border-t-2 border-gray-300" />

          <p className="text-sm text-gray-500 text-center">
            Please enter your new password and confirm it. Both passwords must
            be at least 8 characters long.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
