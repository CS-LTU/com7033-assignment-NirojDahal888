// pages/SessionExpired.jsx
import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function SessionExpired() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Session Expired
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your session has expired or you are not logged in. 
          Please log in again to continue accessing the patient management system.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> For your protection, sessions expire after a period of inactivity. 
            This helps keep patient data secure.
          </p>
        </div>
<a href="/" className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">Login</a>
        <p className="mt-4 text-sm text-gray-500">
          If you continue to experience issues, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}
