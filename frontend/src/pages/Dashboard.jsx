import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.username}</h1>
      <button
        onClick={logout}
        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
