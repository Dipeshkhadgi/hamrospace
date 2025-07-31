import React, { memo } from "react";
import { FaTimes } from "react-icons/fa";

const ChatPopUp = memo(({ togglePopup, chatGroups }) => {
  const handleClose = () => {
    togglePopup();
  };
  return (
    <>
      <div className="absolute top-10 right-0 w-80 bg-white shadow-lg rounded-lg z-10">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg text-black font-semibold font-roboto">
            Chats
          </h3>
          <FaTimes
            className="text-gray-500 cursor-pointer hover:text-gray-800"
            onClick={handleClose}
          />
        </div>

        {/* Chat List */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {chatGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={group.img}
                alt={group.name}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-normal text-black font-roboto">
                  {group.name}
                </p>
                <p className="text-sm text-gray-600">{group.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
export default ChatPopUp;
