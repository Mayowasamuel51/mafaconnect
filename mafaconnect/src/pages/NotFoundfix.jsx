import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center p-6">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
        <p className="mb-4 text-lg text-gray-600">Oops! Page not found.</p>
        <a
          href="/"
          className="text-blue-600 underline hover:text-blue-800 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
