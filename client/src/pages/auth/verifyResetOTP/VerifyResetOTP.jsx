import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  clearAuthError,
  resetOTPVerify,
} from "../../../redux/features/auth/authSlice";
import { useForm } from "react-hook-form";

const VerifyResetOTP = () => {
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const handleInputChange = (value, index) => {
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    if (value !== "" && index < otpDigits.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const onSubmit = (data) => {
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setError("otp", {
        type: "manual",
        message: "Please enter all OTP digits.",
      });
      return;
    }

    clearErrors("otp");

    const resetOTPValue = {
      userId: user._id,
      email: user.email,
      otp: parseInt(otp),
    };

    dispatch(resetOTPVerify({ resetOTPValue, toast, navigate }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  return (
    <>
      <div className="font-roboto flex h-screen justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 font-roboto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-roboto">
            Verify your OTP?
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center items-center gap-2 mb-4">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  className="p-3 bg-transparent font-gothamNarrow rounded border border-gray-300 text-[#000000] focus:outline-none focus:border-blue-500 text-lg sm:text-xl lg:text-2xl text-center w-12 sm:w-12 lg:w-14 h-12 sm:h-16 lg:h-14"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full font-roboto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
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

          <p className="text-sm text-gray-500 text-center font-roboto">
            Please enter the 6-digit OTP code sent to your email to verify your
            account, just like the one we sent you in Gmail. Check your inbox
            (or spam) for the instructions to reset your password.
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyResetOTP;
