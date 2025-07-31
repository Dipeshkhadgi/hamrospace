import React from 'react';
import { FaPenFancy, FaVideo, FaPhotoVideo } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const ContentPopUpModal = ({ handleClose }) => {
  return (
    <div className="absolute right-0 top-full mt-4 w-60 bg-white shadow-lg rounded-md z-50">
      <ul className="py-3 font-roboto text-sm">
        <li 
          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-300"
          
        >
          <FaPenFancy className="text-blue-500 mr-3" />
          <NavLink to="/create-post" className="text-gray-800">Create Post</NavLink>
        </li>
        <li 
          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-300"
          
        >
          <FaVideo className="text-red-500 mr-3" />
          <span className="text-gray-800">Create Reel</span>
        </li>
        <li 
          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-300"
         
        >
          <FaPhotoVideo className="text-green-500 mr-3" />
          <span className="text-gray-800">Go Live</span>
        </li>
        <li className="flex items-center justify-end px-4 py-2">
          <button
            className="text-gray-500 hover:text-blue-600 text-xs transition duration-300"
            onClick={handleClose}
          >
            Close
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContentPopUpModal;
