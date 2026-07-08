import React from 'react';

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-gray-300 border-t-black animate-spin"></div>
        <span className="absolute text-xs text-gray-700 font-semibold animate-pulse"></span>
      </div>
    </div>
  );
}
