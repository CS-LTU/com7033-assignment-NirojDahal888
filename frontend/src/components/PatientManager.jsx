import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Loader2, Check, AlertCircle, ArrowUp, ArrowDown, Activity, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatientForm from './PatientForm';

const API_URL = 'http://localhost:8000';

const apiCall = async (endpoint, options = {}, navigate = null) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  
  // Check if unauthorized (401)
  if (response.status === 401) {
    if (navigate) {
      // Session expired, redirect to session expired page
      navigate('/session-expired');
    }
    throw new Error('Session expired. Please login again.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export default function PatientManager() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('age');
  const [sortOrder, setSortOrder] = useState(1); // 1=asc, -1=desc

  // Prediction state
  const [prediction, setPrediction] = useState(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const perPage = 20;

  const loadPatients = async () => {
    setLoading(true);
    try {
      const query = `/api/patients?page=${page}&per_page=${perPage}&sort_field=${sortField}&sort_order=${sortOrder}`;
      const data = await apiCall(query, {}, navigate);
      setPatients(data.patients);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load patient data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [page, sortField, sortOrder]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await apiCall(`/api/patients/${id}`, { method: 'DELETE' }, navigate);
      setSuccess('Patient deleted successfully!');
      setError('');
      loadPatients();
    } catch (err) {
      setError(err.message || 'Failed to delete patient.');
      setSuccess('');
    }
  };

  const handleSuccess = (msg) => {
    setSuccess(msg);
    setError('');
    loadPatients();
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
  };

  // Predict stroke risk for a patient
  const handlePredict = async (patient) => {
    setPredictionLoading(true);
    try {
      const data = await apiCall(`/api/predict/patient/${patient._id}`, {}, navigate);
      setPrediction(data);
      setShowPrediction(true);
    } catch (err) {
      setError(err.message || 'Failed to get stroke prediction.');
    } finally {
      setPredictionLoading(false);
    }
  };

  // Load dataset statistics
  const loadStatistics = async () => {
    try {
      const data = await apiCall('/api/predict/statistics', {}, navigate);
      setStatistics(data);
      setShowStats(true);
    } catch (err) {
      setError(err.message || 'Failed to load statistics.');
    }
  };

  // View patient details with authentication check
  const handleViewPatient = async (patient) => {
    try {
      // Verify session is still valid by making an API call
      await apiCall(`/api/patients/${patient._id}`, {}, navigate);
      // If successful, show the patient details
      setViewPatient(patient);
    } catch (err) {
      setError(err.message || 'Session expired. Please login again.');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  // Define specific columns to display (excluding _id and heart_disease from display)
  const displayColumns = ['gender', 'age', 'hypertension', 'heart_disease', 'ever_married', 'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status', 'stroke'];

  // Get risk level color
  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MODERATE': return 'text-orange-600 bg-orange-100';
      case 'LOW': return 'text-yellow-600 bg-yellow-100';
      case 'VERY LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Stroke Patient Records</h2>
        <div className="flex gap-2">
          <button
            onClick={loadStatistics}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <BarChart3 className="w-5 h-5" /> Statistics
          </button>
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Patient
          </button>
        </div>
      </div>

      {/* Success & Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-green-700">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-indigo-600 text-white">
              <tr>
                {displayColumns.map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left cursor-pointer select-none text-sm"
                    onClick={() => toggleSort(col)}
                  >
                    {col.replace(/_/g, ' ').replace('Residence type', 'Residence')}
                    {sortField === col && (
                      sortOrder === 1 ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={displayColumns.length + 1} className="text-center py-6 text-gray-500">
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    {displayColumns.map((col) => (
                      <td key={col} className="py-3 px-4 text-sm">
                        {p[col] === null || p[col] === undefined ? 'N/A' : 
                         typeof p[col] === 'number' && !Number.isInteger(p[col]) ? p[col].toFixed(1) : 
                         String(p[col])}
                      </td>
                    ))}
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        onClick={() => handlePredict(p)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Predict Stroke Risk"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewPatient(p)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPatient(p);
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(total / perPage)} ({total} total patients)
        </span>
        <button
          disabled={page === Math.ceil(total / perPage) || total === 0}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <PatientForm
          onClose={() => setShowForm(false)}
          editingPatient={editingPatient}
          refresh={() => handleSuccess(editingPatient ? 'Patient updated successfully!' : 'Patient added successfully!')}
        />
      )}

      {/* View Modal */}
      {viewPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">Patient Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(viewPatient).map(
                ([key, value]) =>
                  key !== '_id' && (
                    <p key={key}>
                      <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {value === null ? 'N/A' : String(value)}
                    </p>
                  )
              )}
            </div>
            <button
              onClick={() => setViewPatient(null)}
              className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Prediction Modal */}
      {showPrediction && prediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Stroke Risk Prediction
            </h3>
            
            {/* Risk Score */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-gray-800">{prediction.prediction.risk_score}</div>
              <div className="text-sm text-gray-500">Risk Score (0-100)</div>
              <div className={`inline-block mt-2 px-4 py-1 rounded-full font-semibold ${getRiskColor(prediction.prediction.risk_level)}`}>
                {prediction.prediction.risk_level} RISK
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Risk Analysis:</h4>
              <div className="space-y-2">
                {Object.entries(prediction.prediction.analysis).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">{value} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Risk Factors:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {prediction.prediction.risk_factors.map((factor, i) => (
                  <li key={i} className="text-gray-700">{factor}</li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-1">Recommendation:</h4>
              <p className="text-sm text-blue-700">{prediction.prediction.recommendation}</p>
            </div>

            <button
              onClick={() => setShowPrediction(false)}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && statistics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Dataset Statistics
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Total Patients:</span>
                <span className="font-bold">{statistics.total_patients}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Stroke Cases:</span>
                <span className="font-bold text-red-600">{statistics.stroke_cases}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Stroke Rate:</span>
                <span className="font-bold">{statistics.stroke_rate}%</span>
              </div>
              {statistics.stroke_patient_avg_age && (
                <>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Avg Age (Stroke Patients):</span>
                    <span className="font-bold">{statistics.stroke_patient_avg_age} years</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Avg Glucose (Stroke Patients):</span>
                    <span className="font-bold">{statistics.stroke_patient_avg_glucose} mg/dL</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>With Hypertension:</span>
                    <span className="font-bold">{statistics.stroke_with_hypertension}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>With Heart Disease:</span>
                    <span className="font-bold">{statistics.stroke_with_heart_disease}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay for prediction */}
      {predictionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <span>Analyzing stroke risk...</span>
          </div>
        </div>
      )}
    </div>
  );
}
