import React from "react";
import OJA247Logo from "../assets/OJA247 PNG.PNG";

/**
 * Universal full-screen loader.
 *
 * Usage:
 *   if (loading) return <Loader text="Loading businesses..." />;
 *
 * Props:
 *   text  - optional message shown under the animation (default: "Loading...")
 */
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center">
        <img
          src={OJA247Logo}
          alt="OJA247"
          className="w-16 h-auto animate-pulse"
        />

        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></span>
          <span
            className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>

        <p className="mt-3 text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
};

export default Loader;