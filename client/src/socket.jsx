import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

// Create Socket Context
const SocketContext = createContext();

// Custom hook to access the socket
const getSocket = () => useContext(SocketContext);

// SocketProvider Component
const SocketProvider = ({ children }) => {
  const socket = useMemo(
    () =>
      io("http://localhost:5000", {
        withCredentials: true,
        auth: {
          token: localStorage.getItem("AuthID"),
        },
        transports: ["websocket"],
      }),
    []
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };
