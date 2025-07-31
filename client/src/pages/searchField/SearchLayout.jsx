import React, { useEffect, useState, useCallback } from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import {
  clearAuthError,
  searchUser,
  sendFriendRequest,
} from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const SearchLayout = () => {
  const { isLoading, error, allUsers, isError } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query) {
        dispatch(searchUser({ name: query }));
      }
    }, 300),
    [dispatch]
  );

  const handleSendRequest = (userId) => {
    const data = {
      receiverId: userId,
    };
    dispatch(sendFriendRequest({ data, toast }));
  };

  // Search Query Effect
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Handle API Error
  useEffect(() => {
    if (error) {
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (searchQuery && allUsers) {
      const suggestions = allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, allUsers]);

  useEffect(() => {
    if (isError) {
      toast.error(isError);
      dispatch(clearAuthError());
    }
  }, [dispatch, isError]);

  return (
    <div className="relative w-full max-w-lg mx-auto font-roboto pt-4">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-md">
        <FaSearch className="text-gray-500 text-xl" />
        <input
          type="text"
          className="flex-grow bg-transparent outline-none px-3 text-gray-800"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Suggestions Dropdown */}
      {searchQuery && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 z-10">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-8 h-8 text-gray-500 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-gray-800">
                      {user.name}
                    </span>
                    <div className="text-sm text-gray-500">
                      {user.postsCount || 0} new posts
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="relative bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600"
                  onClick={() => handleSendRequest(user._id)}
                >
              
                  Add Friend
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchLayout;
