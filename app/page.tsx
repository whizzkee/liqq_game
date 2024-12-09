import React from 'react';

const LiqqLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
          Liqq game
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 tracking-wide max-w-2xl mx-auto">
          Coming Soon
        </p>
        <div className="flex justify-center space-x-4 pt-8">
        </div>
      </div>
    </div>
  );
};

export default LiqqLandingPage;