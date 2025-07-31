import { useEffect, useRef, useState } from "react";
import { FaExclamationTriangle, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuthError, login } from "../../../redux/features/auth/authSlice";

const Login = () => {
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(true);

  // Enhanced security states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: "", color: "" });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState("");
  const [isSuspiciousActivity, setIsSuspiciousActivity] = useState(false);

  // Security tracking
  const loginAttemptsRef = useRef(0);
  const lastFailedAttemptRef = useRef(null);
  const ipTrackingRef = useRef(new Set());

  // Generate simple captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaChallenge(result);
    setCaptchaValue("");
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 1;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push("lowercase letter");

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push("uppercase letter");

    if (/\d/.test(password)) strength += 1;
    else feedback.push("number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    else feedback.push("special character");

    if (password.length >= 12) strength += 1;
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*(.)\1{2,})/.test(password)) strength += 1;

    let level, text, color;
    if (strength <= 2) {
      level = 1;
      text = "Weak";
      color = "text-red-500";
    } else if (strength <= 4) {
      level = 2;
      text = "Medium";
      color = "text-yellow-500";
    } else if (strength <= 6) {
      level = 3;
      text = "Strong";
      color = "text-green-500";
    } else {
      level = 4;
      text = "Very Strong";
      color = "text-green-600";
    }

    return { level, text, color, feedback };
  };

  // Enhanced form validation
  const validatedForm = () => {
    let newErrors = {};

    // Email validation with additional security checks
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (email.length > 254) {
      newErrors.email = "Email is too long";
    } else if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      newErrors.email = "Invalid email format";
    }

    // Enhanced password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (password.length > 128) {
      newErrors.password = "Password is too long (max 128 characters)";
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
    } else if (/(.)\1{2,}/.test(password)) {
      newErrors.password = "Password cannot contain repeated characters";
    } else if (/^(?:password|123456|qwerty|abc123|admin|root|user)$/i.test(password)) {
      newErrors.password = "This password is too common and not secure";
    }

    // Captcha validation
    if (showCaptcha && captchaValue.toUpperCase() !== captchaChallenge) {
      newErrors.captcha = "Captcha verification failed";
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>\"']/,  // Potential XSS
      /union.*select/i,  // SQL injection
      /javascript:/i,  // XSS
      /%[0-9a-f]{2}/i  // URL encoding
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(email) || pattern.test(password))) {
      setIsSuspiciousActivity(true);
      newErrors.security = "Suspicious input detected. Please contact support if this is legitimate.";
    }

    setLoginErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle account lockout
  const handleFailedLogin = () => {
    loginAttemptsRef.current += 1;
    setLoginAttempts(loginAttemptsRef.current);
    lastFailedAttemptRef.current = Date.now();

    if (loginAttemptsRef.current >= 3) {
      setShowCaptcha(true);
      generateCaptcha();
    }

    if (loginAttemptsRef.current >= 5) {
      setIsBlocked(true);
      setBlockTimeLeft(300); // 5 minutes
      toast.error("Account temporarily locked due to multiple failed attempts. Please try again in 5 minutes.");
    }
  };

  // Handle successful login
  const handleSuccessfulLogin = () => {
    loginAttemptsRef.current = 0;
    setLoginAttempts(0);
    setShowCaptcha(false);
    setIsBlocked(false);
    setIsSuspiciousActivity(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const strength = checkPasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ level: 0, text: "", color: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error("Account is temporarily locked. Please wait before trying again.");
      return;
    }

    if (isSuspiciousActivity) {
      toast.error("Suspicious activity detected. Please contact support.");
      return;
    }

    if (validatedForm()) {
      const loginData = {
        email: email.toLowerCase().trim(),
        password,
        rememberMe: isChecked,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      dispatch(login({
        loginData,
        toast,
        navigate,
        onSuccess: handleSuccessfulLogin,
        onFailure: handleFailedLogin
      }));
    } else {
      toast.warn("Please correct the errors and try again");
      handleFailedLogin();
    }
  };

  // Block countdown timer
  useEffect(() => {
    let timer;
    if (isBlocked && blockTimeLeft > 0) {
      timer = setInterval(() => {
        setBlockTimeLeft(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setShowCaptcha(false);
            loginAttemptsRef.current = 0;
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimeLeft]);

  // Generate captcha on mount if needed
  useEffect(() => {
    if (showCaptcha && !captchaChallenge) {
      generateCaptcha();
    }
  }, [showCaptcha, captchaChallenge]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
      handleFailedLogin();
    }
  }, [dispatch, error]);

  const getPasswordStrengthBar = () => {
    const { level } = passwordStrength;
    const segments = 4;
    const filledSegments = level;

    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(segments)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i < filledSegments
                ? level === 1 ? 'bg-red-500'
                  : level === 2 ? 'bg-yellow-500'
                    : level === 3 ? 'bg-green-500'
                      : 'bg-green-600'
                : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="font-roboto flex h-screen justify-center items-center min-h-screen bg-gray-100">
      <div className="w-1/2 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Secure Login Portal
          </h3>
          <p className="text-sm text-gray-600">
            Your security is our priority. Enhanced protection for your account.
          </p>
          {loginAttempts > 0 && (
            <div className="mt-4 p-2 bg-yellow-100 rounded border border-yellow-300">
              <FaExclamationTriangle className="inline text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-700">
                {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 font-roboto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-roboto">
          Secure Login
        </h2>

        {isBlocked && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700 text-sm">
              Account locked. Try again in {Math.floor(blockTimeLeft / 60)}:{String(blockTimeLeft % 60).padStart(2, '0')}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-500 font-medium mb-2">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="appearance-none text-sm font-roboto block w-full bg-neutral-50 text-neutral-600 border border-stone-200 rounded-sm py-4 px-4 leading-tight focus:outline-none focus:border-blue-600 tracking-normal"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              disabled={isBlocked}
              maxLength={254}
            />
            {loginErr.email && <p className="text-red-500 text-xs mt-1">{loginErr.email}</p>}
          </div>

          {/* Password Input */}
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-500 mb-2" htmlFor="password">
              Password*
            </label>
            <div className="relative w-full">
              <input
                className="appearance-none text-sm font-roboto block w-full bg-neutral-50 text-neutral-600 border border-stone-300 rounded-sm py-4 px-4 leading-tight focus:outline-none focus:border-blue-600 tracking-normal"
                id="password"
                name="password"
                autoComplete="current-password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isBlocked}
                maxLength={128}
              />
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

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                {getPasswordStrengthBar()}
                <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.text}
                </p>
                {passwordStrength.feedback && passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Missing: {passwordStrength.feedback.join(", ")}
                  </p>
                )}
              </div>
            )}

            {loginErr.password && <p className="text-red-500 text-xs mt-1">{loginErr.password}</p>}
          </div>

          {/* Captcha */}
          {showCaptcha && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Security Verification*
              </label>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-200 px-4 py-2 rounded font-mono text-lg tracking-widest select-none">
                  {captchaChallenge}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Refresh
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter the code above"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                className="mt-2 appearance-none text-sm block w-full bg-neutral-50 text-neutral-600 border border-stone-200 rounded-sm py-2 px-4 focus:outline-none focus:border-blue-600"
                maxLength={5}
              />
              {loginErr.captcha && <p className="text-red-500 text-xs mt-1">{loginErr.captcha}</p>}
            </div>
          )}

          <div className="flex items-center justify-between mb-4 w-full px-3">
            <div className="flex items-center">
              <input
                id="rememberPassword"
                type="checkbox"
                className="mr-2 leading-tight accent-blue-500"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="rememberPassword" className="text-sm font-roboto text-neutral-600">
                Keep me signed in
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-roboto text-neutral-600 hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Security error */}
          {loginErr.security && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
              <p className="text-red-700 text-xs">{loginErr.security}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isBlocked || isSuspiciousActivity}
            className={`relative w-full font-roboto py-4 px-4 rounded-md focus:outline-none ${isLoading || isBlocked || isSuspiciousActivity
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600'
              } text-white`}
          >
            {isLoading && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </span>
            )}
            {isBlocked ? 'Account Locked' : 'Secure Login'}
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-4 text-center font-roboto">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-blue-500 hover:text-blue-700">
              Create Account
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Protected by advanced security measures
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;