import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${API_BASE}/patients/${id}`, { withCredentials: true });
        setPatient(response.data);
      } catch (err) {
        setError('Failed to load patient');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await axios.delete(`${API_BASE}/patients/${id}`, { withCredentials: true });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete patient');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error || !patient) return <div className="text-red-500 text-center">{error || 'Patient not found'}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Patient Details</h2>
      <div className="space-y-4">
        {Object.entries(patient).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key.replace('_', ' ')}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 space-x-4">
        <button
          onClick={() => navigate(`/patients/${id}`)} // Note: For edit, route to /patients/:id but use form; here we can link to edit
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PatientDetail;