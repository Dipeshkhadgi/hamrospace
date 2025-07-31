import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuthError, register } from "../../../redux/features/auth/authSlice";

const Register = () => {
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [registerValue, setRegisterValue] = useState({
    name: "",
    email: "",
    mobile_No: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, mobile_No, gender, password, confirmPassword } =
    registerValue;

  const [registerErr, setRegisterErr] = useState({});
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const generateCaptcha = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptchaText(random);
  };

  const isCaptchaValid = userCaptchaInput === captchaText && isChecked;


  useEffect(() => {
    generateCaptcha();
  }, []);

  const validatedForm = () => {
    let newErrors = {};

    if (!name) newErrors.name = "Name is required";
    if (!gender) newErrors.gender = "Gender is required";

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!mobile_No) {
      newErrors.mobile_No = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobile_No)) {
      newErrors.mobile_No = "Mobile number must be 10 digits";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords must match";
    }

    if (userCaptchaInput !== captchaText) {
      newErrors.captcha = "CAPTCHA does not match";
      generateCaptcha(); // regenerate new CAPTCHA on fail
    }

    if (!isChecked) {
      newErrors.checkbox = "You must agree to continue";
    }

    setRegisterErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    setRegisterValue({ ...registerValue, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatedForm()) {
      dispatch(register({ registerData: registerValue, toast, navigate }));
    } else {
      toast.warn("Please fill in all required fields correctly!");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  return (
    <div className="font-roboto flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="w-2/5 min-w-[500px] flex bg-white rounded-lg shadow-md p-8 border border-gray-300">
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create a New Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-500 font-medium mb-2">Name*</label>
                <input
                  type="text"
                  name="name"
                  className="text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                  placeholder="Enter your Full Name"
                  value={name}
                  onChange={handleChange}
                />
                {registerErr.name && (
                  <p className="text-red-500 text-xs mt-1">{registerErr.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-2">Gender*</label>
                <select
                  name="gender"
                  value={gender}
                  onChange={handleChange}
                  className="block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {registerErr.gender && (
                  <p className="text-red-500 text-xs mt-1">{registerErr.gender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-500 font-medium mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  className="text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleChange}
                />
                {registerErr.email && (
                  <p className="text-red-500 text-xs mt-1">{registerErr.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-500 font-medium mb-2">
                  Mobile Number*
                </label>
                <input
                  type="number"
                  name="mobile_No"
                  className="text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                  placeholder="Enter your mobile number"
                  value={mobile_No}
                  onChange={handleChange}
                />
                {registerErr.mobile_No && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerErr.mobile_No}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Password*
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  className="text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                  placeholder="********"
                  value={password}
                  onChange={handleChange}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <FaEyeSlash className="text-neutral-600" />
                  ) : (
                    <FaEye className="text-neutral-600" />
                  )}
                </div>
              </div>
              {registerErr.password && (
                <p className="text-red-500 text-xs mt-1">{registerErr.password}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  className="text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-3 px-4"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={handleChange}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? (
                    <FaEyeSlash className="text-neutral-600" />
                  ) : (
                    <FaEye className="text-neutral-600" />
                  )}
                </div>
              </div>
              {registerErr.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {registerErr.confirmPassword}
                </p>
              )}
            </div>

            {/* CAPTCHA */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                CAPTCHA Verification*
              </label>
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 text-lg font-bold tracking-widest text-black px-4 py-2 rounded-md select-none">
                  {captchaText}
                </div>
                <input
                  type="text"
                  placeholder="Enter CAPTCHA"
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              {registerErr.captcha && (
                <p className="text-red-500 text-xs mt-1">{registerErr.captcha}</p>
              )}
            </div>

            {/* Checkbox */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-600">I'm not a robot</span>
              </label>
              {registerErr.checkbox && (
                <p className="text-red-500 text-xs mt-1">{registerErr.checkbox}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isCaptchaValid}
              className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-3 px-4 rounded-md focus:outline-none transition-opacity ${isLoading || !isCaptchaValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
                }`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>


            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:text-blue-700">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
