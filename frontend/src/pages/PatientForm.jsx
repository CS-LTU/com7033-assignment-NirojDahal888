import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    gender: '',
    age: '',
    hypertension: 0,
    heart_disease: 0,
    ever_married: '',
    work_type: '',
    Residence_type: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: '',
    stroke: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!id;

  const API_BASE = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (isEdit) {
      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${API_BASE}/patients/${id}`, { withCredentials: true });
          setPatient(response.data);
        } catch (err) {
          setError('Failed to load patient');
        }
      };
      fetchPatient();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/patients/${id}`, patient, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/patients`, patient, { withCredentials: true });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? 'Edit Patient' : 'Add New Patient'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Gender</label>
            <select name="gender" value={patient.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Age</label>
            <input type="number" name="age" value={patient.age} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Hypertension (0/1)</label>
            <input type="number" name="hypertension" value={patient.hypertension} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" min="0" max="1" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Heart Disease (0/1)</label>
            <input type="number" name="heart_disease" value={patient.heart_disease} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" min="0" max="1" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Ever Married</label>
            <select name="ever_married" value={patient.ever_married} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Work Type</label>
            <select name="work_type" value={patient.work_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select</option>
              <option value="Private">Private</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Govt_job">Govt_job</option>
              <option value="children">children</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Residence Type</label>
            <select name="Residence_type" value={patient.Residence_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select</option>
              <option value="Urban">Urban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Avg Glucose Level</label>
            <input type="number" step="0.01" name="avg_glucose_level" value={patient.avg_glucose_level} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">BMI</label>
            <input type="number" step="0.1" name="bmi" value={patient.bmi} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Smoking Status</label>
            <select name="smoking_status" value={patient.smoking_status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select</option>
              <option value="formerly smoked">formerly smoked</option>
              <option value="never smoked">never smoked</option>
              <option value="smokes">smokes</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Stroke (0/1)</label>
            <input type="number" name="stroke" value={patient.stroke} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" min="0" max="1" required />
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Patient' : 'Create Patient')}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;