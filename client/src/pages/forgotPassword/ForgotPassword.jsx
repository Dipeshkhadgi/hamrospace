import React, { useEffect ,useState} from 'react'
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearAuthError, forgotPassword } from '../../redux/features/auth/authSlice';

const ForgotPassword = () => {

  const {isLoading,error} = useSelector((state) => state.auth);
  const dispatchg = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [forgotErr,setForgotErr] = useState({});

  const validatedForm = ()=>{
    let newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setForgotErr(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validatedForm()){
      const forgotData = {
        email,
      }
      dispatchg(forgotPassword({forgotData,toast,navigate}));

    }else{
      toast.warn("Please fill out the form correctly!");
    }
  }
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatchg(clearAuthError());
    }
  }, [dispatchg, error]);
  
  return (
    <>
      <div className="font-roboto flex h-screen justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 font-roboto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-roboto">
            Forgot Your Password?
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-500 font-medium mb-2"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="appearance-none text-sm font-roboto block w-full bg-neutral-50 text-neutral-600 border border-stone-200 rounded-sm py-4 px-4 leading-tight focus:outline-none focus:border-blue-600 tracking-normal"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {forgotErr.email && (
                <p className="text-red-500 text-xs font-roboto">
                  {forgotErr.email}
                </p>
              )}
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
          
          <p className="text-sm text-gray-500 text-center">
            Enter your email to receive an OTP Code. Please check your inbox (or spam) for the instructions to reset your password.
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
