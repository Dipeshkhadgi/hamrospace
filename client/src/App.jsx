import { lazy, Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import TopHeader from "./components/header/TopHeader";
import ProfileInformation from "./pages/auth/profileInfo/ProfileInformation";
import Register from "./pages/auth/register/Register";
import ResetPassword from "./pages/auth/resetPassword/ResetPassword";
import VerifyAccount from "./pages/auth/verifyAcount/VerifyAccount";
import VerifyResetOTP from "./pages/auth/verifyResetOTP/VerifyResetOTP";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";
import PageNotFound from "./pages/notFound/PageNotFound";
import SearchLayout from "./pages/searchField/SearchLayout";
const AddPost = lazy(() => import("./pages/addPost/AddPost"));

// Lazy-loaded pages
const Groups = lazy(() => import("./pages/group/Groups"));
const Login = lazy(() => import("./pages/auth/login/Login"));
const Home = lazy(() => import("./pages/home/Home"));

function App() {
  const { isAuthenticated, adminRoute, user } = useSelector(
    (state) => state.auth
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <Router>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="custom-toast-container"
        />

        <Suspense fallback={<h1>Loading...</h1>}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {isAuthenticated ? (
                    <>
                      <TopHeader />
                      <Home />
                    </>
                  ) : (
                    <Login />
                  )}
                </>
              }
            />

            <Route
              path="/sign-up"
              element={
                <>
                  <Register />
                </>
              }
            />
            <Route
              path="/search-user"
              element={
                <>
                  <SearchLayout />
                </>
              }
            />
            <Route
              path="/verify-account"
              element={
                <>
                  <VerifyAccount />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Login />
                </>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <>
                  <ForgotPassword />
                </>
              }
            />
            <Route
              path="/verify-reset-password"
              element={
                <>
                  <VerifyResetOTP />
                </>
              }
            />
            <Route
              path="/create-post"
              element={
                <>
                  <TopHeader />
                  <AddPost />
                </>
              }
            />
            <Route
              path="/reset-password"
              element={
                <>
                  <ResetPassword />
                </>
              }
            />

            <Route
              path="/profile-information"
              element={
                <>
                  <TopHeader />
                  <ProfileInformation />
                </>
              }
            />


            <Route
              path="*"
              element={
                <>
                  <PageNotFound />
                </>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
