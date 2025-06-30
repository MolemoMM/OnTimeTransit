import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-4">Tailwind CSS Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-2">Card 1</h3>
          <p className="opacity-90">This card tests modern styling with Tailwind CSS.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-2">Card 2</h3>
          <p className="opacity-90">Gradient backgrounds and smooth animations.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-2">Card 3</h3>
          <p className="opacity-90">Responsive design with utility classes.</p>
        </div>
      </div>
      <button className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
        Test Button
      </button>
    </div>
  );
};

export default TailwindTest;
