import React, { useEffect, useState } from "react";
import { FaImage } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPostError,
  createPost,
} from "../../redux/features/post/postSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddPost = () => {
  const { isLoading, error } = useSelector((state) => state.post);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [postImg, setPostImg] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setPostImagePreview(reader.result);
        setPostImg(file);
      };

      reader.onerror = () => {
        console.error("There was an error reading the file!");
      };
    }
  };

  const handlePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("postImg", postImg);
    dispatch(createPost({ formData, toast, navigate }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPostError());
    }
  }, [dispatch, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white border-2 border-gray-300 shadow-lg rounded-md p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img
                src={user?.avatar?.url}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>

          <textarea
            placeholder="What's on your mind?"
            className="w-full appearance-none text-sm font-roboto block bg-neutral-50 text-neutral-600 border border-stone-200 rounded-sm py-2 px-3 leading-tight focus:outline-none focus:border-blue-600"
            rows="3"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          ></textarea>
        </div>
        {postImagePreview && (
          <div className="mt-4">
            <img
              src={postImagePreview}
              alt="postImagePreview"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <label
            htmlFor="file-upload"
            className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition"
          >
            <FaImage className="mr-2" />
            Add Photo
            <input
              id="file-upload"
              type="file"
              name="postImg"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          <button
            onClick={handlePost}
            disabled={isLoading}
            className="relative px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition"
          >
            {isLoading && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </span>
            )}
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
