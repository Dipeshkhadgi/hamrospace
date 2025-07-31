import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import {
  FaBell,
  FaHome,
  FaNewspaper,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { GoSignOut } from "react-icons/go";
import { HiOutlineUser, HiOutlineUserCircle } from "react-icons/hi";
import { MdOutlineAddCircleOutline, MdOutlineDashboardCustomize } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ChatImg from "../../assets/images/LogoImge.jpg";
import ChatPopUp from "../../pages/chatLayout/chatPopUp/ChatPopUp";
import ContentPopUpModal from "../../pages/contentPopup/ContentPopUpModal";
import NotificationPopUp from "../../pages/notificationPopUp/NotificationPopUp";
import { setLogout } from "../../redux/features/auth/authSlice";

const TopHeader = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isShownDropDown, setIsShownDropDown] = useState(false);
  const [isShownModal, setIsShownModal] = useState(false);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isNotificationPopup, setIsNotificationPopUp] = useState(false);

  const chatGroups = [
    {
      id: 1,
      name: "John Doe",
      message: "Hey, how's it going?",
      img: "/john.jpg",
    },
    {
      id: 2,
      name: "Jane Smith",
      message: "Can we meet tomorrow?",
      img: "/jane.jpg",
    },
    {
      id: 3,
      name: "Alice Brown",
      message: "Thanks for the update!",
      img: "/alice.jpg",
    },
  ];
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };
  const toggleNotificationPopup = () => {
    setIsNotificationPopUp(!isNotificationPopup);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("AuthID");

  const handleShowDropdown = () => {
    setIsShownDropDown(!isShownDropDown);
  };
  const handleDropdownClose = () => {
    setIsShownDropDown(false);
  };

  const handleOptionClick = () => {
    setIsShownModal(!isShownModal);
  };

  const handleClose = () => {
    setIsShownModal(false);
  };

  const handleLogout = () => {
    dispatch(setLogout());
    toast.success("Logout successFully!");
    navigate("/login");
  };

  if (authToken) {
    try {
      const decodedData = jwtDecode(authToken);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      if (decodedData.exp && decodedData.exp < currentTimeInSeconds) {
        dispatch(setLogout());
        localStorage.clear();
        navigate("/login");
        toast.warn("Your session has expired,Please login!");
      }
    } catch (error) {
      dispatch(setLogout());
      localStorage.clear();
      navigate("/login");
    }
  }
  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white fixed top-0 w-full z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* Left Side - Logo and Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <img
                src={ChatImg}
                alt="ChatLogo"
                className="hover:text-gray-200 h-12 w-12"
              />
            </div>
          </div>

          {/* Center - Navigation Icons */}
          <div className="flex space-x-16">
            <NavLink to="/" className="text-4xl hover:text-gray-200">
              <FaHome />
            </NavLink>
            <NavLink to="/news" className="text-4xl hover:text-gray-200">
              <FaNewspaper />
            </NavLink>
            <NavLink to="/friends" className="text-4xl hover:text-gray-200">
              <FaUserFriends />
            </NavLink>
            <NavLink
              to={"#"}
              className="text-4xl hover:text-gray-200"
              onClick={handleOptionClick}
            >
              <MdOutlineAddCircleOutline />
            </NavLink>
            <NavLink to="/search-user" className="text-4xl hover:text-gray-200">
              <FaSearch />
            </NavLink>
          </div>

          {/* Right Side - Notifications */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={handleShowDropdown}
                  >
                    {user?.avatar ? (
                      <img
                        src={user?.avatar?.url}
                        alt="avatar Img"
                        className="w-6 h-6 object-cover rounded-full align-middle"
                      />
                    ) : (
                      <HiOutlineUserCircle className="text-white" size={24} />
                    )}
                    <span className="text-sm text-white font-roboto">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>
                  {isShownDropDown && (
                    <div className="absolute right-0 top-full mt-4 w-48 bg-white shadow-sm rounded-sm z-50">
                      <ul className="py-2 tracking-wider font-roboto">
                        <li className="flex items-center px-4 py-2 text-gray-500 text-sm">
                          <NavLink
                            to="/profile-information"
                            onClick={handleDropdownClose}
                            className="text-gray-800 hover:text-blue-600 transition duration-300"
                          >
                            <HiOutlineUserCircle className="inline-block mr-2" />{" "}
                            My Account
                          </NavLink>
                        </li>

                        {user && user.role === "admin" && (
                          <li className="flex items-center px-4 py-2 text-gray-500 text-sm">
                            <NavLink
                              to="/baltra-admin-dashboard"
                              className="text-gray-800 hover:text-blue-600 transition duration-300"
                            >
                              <MdOutlineDashboardCustomize className="inline-block mr-2" />{" "}
                              Dashboard
                            </NavLink>
                          </li>
                        )}
                        <li className="px-4 py-2">
                          <button
                            onClick={handleLogout}
                            className="text-gray-800 hover:text-blue-600 transition duration-300"
                          >
                            <GoSignOut className="inline-block mr-2" /> Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to="/login">
                  <div className="font-roboto flex items-center space-x-2 bg-white rounded-full px-2 sm:px-4 py-1 text-black cursor-pointer">
                    <HiOutlineUser className="w-4 h-4" />
                    <div className="hidden sm:block text-[#000000] text-xs sm:text-sm">
                      Login
                    </div>
                  </div>
                </NavLink>
              )}
            </div>
            <div className="relative">
              <div onClick={toggleNotificationPopup} className="relative">
                <FaBell className="text-2xl cursor-pointer" />
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs text-white rounded-full px-1">
                  0
                </span>
              </div>

              {/* Chat Popup */}
              {isNotificationPopup && (
                <NotificationPopUp toggleNotificationPopup={toggleNotificationPopup} chatGroups={chatGroups} />
              )}
            </div>

            <div className="relative">
              <div onClick={togglePopup} className="relative">
                <FaFacebookMessenger className="text-2xl cursor-pointer" />
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs text-white rounded-full px-1">
                  0
                </span>
              </div>

              {/* Chat Popup */}
              {isPopupVisible && (
                <ChatPopUp togglePopup={togglePopup} chatGroups={chatGroups} />
              )}
            </div>
          </div>
        </div>
        {isShownModal ? (
          <div className="relative">
            <ContentPopUpModal handleClose={handleClose} />
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default TopHeader;
