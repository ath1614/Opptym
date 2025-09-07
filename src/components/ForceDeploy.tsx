import React from 'react';

export default function ForceDeploy() {
  const buildId = `BUILD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white p-2 text-center font-bold text-lg shadow-lg">
      🚀 FORCE DEPLOY v6.0 - {buildId} - {new Date().toLocaleString()}
    </div>
  );
}
