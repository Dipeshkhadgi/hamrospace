import React, { useEffect, useState } from "react";
import InitialLogo from "../../assets/images/LogoImge.jpg";

const InitialLoader = ({ isLoading }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);
    }
  }, [isLoading]);

  return (
    <>
      <div
        className={`flex justify-center items-center min-h-screen bg-white transition-opacity duration-1000 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="animate-spin absolute rounded-full h-28 w-28 md:h-32 md:w-32 border-t-4 border-b-4 border-gray-300"></div>
          <img
            src={InitialLogo}
            alt="Baltra Logo"
            className="relative w-20 h-auto max-w-full md:w-24 lg:w-32 object-contain"
          />
        </div>
      </div>
    </>
  );
};

export default InitialLoader;