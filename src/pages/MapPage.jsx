import React from 'react';

export default function MapPage() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Interactive Map Coming Soon</h3>
        <p className="text-slate-500 max-w-md mx-auto">We are integrating GeoJSON data to visualize flood control projects across the Philippine archipelago.</p>
      </div>
    </div>
  );
}