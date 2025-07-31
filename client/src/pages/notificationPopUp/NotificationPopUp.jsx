import React, { memo, useEffect } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
    acceptFriendRequest,
  clearChatError,
  getNotifications,
  
} from "../../redux/features/chat/chatSlice";
import { toast } from "react-toastify";

const NotificationPopUp = memo(({ toggleNotificationPopup }) => {
  const { isLoading, error,isError, notifications } = useSelector(
    (state) => state.chat
  );

  const dispatch = useDispatch();
  
  const handleClose = () => {
    toggleNotificationPopup();
  };

  const handleAccept = (notificationId) => {
    const data = {
        requestId:notificationId,
        accept:true
    }
    dispatch(acceptFriendRequest({data,toast})).then((result)=>{
        if(!result.error){
            toggleNotificationPopup()

        }
    })
  };

  const handleReject = (notificationId) => {
    // dispatch(rejectFriendRequest(notificationId)); 
  };

  useEffect(() => {
    if (isError) {
      dispatch(clearChatError());
    }
  }, [dispatch, isError]);

  useEffect(() => {
    if (error) {
      dispatch(clearChatError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  return (
    <div className="absolute top-10 right-0 w-80 bg-white shadow-lg rounded-lg z-10">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg text-black font-semibold font-roboto">
          Notifications
        </h3>
        <FaTimes
          className="text-gray-500 cursor-pointer hover:text-gray-800"
          onClick={handleClose}
        />
      </div>

      {/* Chat List */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {notifications && notifications.length > 0 ? (
          notifications.map(({ _id, sender }) => {
            const { name = "Unknown", avatar } = sender || {};
            return (
              <div
                key={_id}
                className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <FaUser className="text-gray-500" />
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="font-normal text-black font-roboto">{name}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleAccept(_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-roboto"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-roboto"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <h4 className="font-roboto text-center py-4">No Data Found</h4>
        )}
      </div>
    </div>
  );
});

export default NotificationPopUp;
