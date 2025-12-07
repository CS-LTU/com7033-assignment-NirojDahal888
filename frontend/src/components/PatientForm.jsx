// components/PatientForm.jsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function PatientForm({ onClose, editingPatient, refresh }) {
  const emptyForm = {
    gender: '',
    age: '',
    hypertension: '',
    ever_married: '',
    work_type: '',
    residence_type: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: '',
    stroke: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // When editingPatient changes, populate the form (and coerce values to strings)
  useEffect(() => {
    if (editingPatient) {
      setForm({
        gender: editingPatient.gender ?? '',
        age: editingPatient.age != null ? String(editingPatient.age) : '',
        hypertension:
          editingPatient.hypertension != null ? String(editingPatient.hypertension) : '',
        ever_married: editingPatient.ever_married ?? '',
        work_type: editingPatient.work_type ?? '',
        residence_type: editingPatient.Residence_type ?? editingPatient.residence_type ?? '',
        avg_glucose_level:
          editingPatient.avg_glucose_level != null
            ? String(editingPatient.avg_glucose_level)
            : '',
        bmi: editingPatient.bmi != null ? String(editingPatient.bmi) : '',
        smoking_status: editingPatient.smoking_status ?? '',
        stroke: editingPatient.stroke != null ? String(editingPatient.stroke) : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingPatient]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // require that fields are not empty string / null / undefined
    const required = Object.keys(form);
    for (let f of required) {
      const v = form[f];
      if (v === '' || v === null || v === undefined) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
    }

    // prepare payload: convert numeric fields to numbers where appropriate
    // Note: heart_disease defaults to 0 for new patients (will be in dataset but not user input)
    const payload = {
      gender: form.gender,
      age: Number(form.age),
      hypertension: Number(form.hypertension),
      heart_disease: editingPatient?.heart_disease ?? 0, // Use existing value or default to 0
      ever_married: form.ever_married,
      work_type: form.work_type,
      Residence_type: form.residence_type,
      avg_glucose_level: Number(form.avg_glucose_level),
      bmi: Number(form.bmi),
      smoking_status: form.smoking_status,
      stroke: Number(form.stroke),
    };

    const method = editingPatient ? 'PUT' : 'POST';
    const url = editingPatient
      ? `${API_URL}/api/patients/${editingPatient._id}`
      : `${API_URL}/api/patients`;

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to parse a helpful message from the server
        const err = await res.json().catch(() => null);
        throw new Error((err && err.error) || 'Operation failed');
      }

      // call parent's refresh (which should show success message and reload)
      if (typeof refresh === 'function') refresh();

      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const selectField = (label, key, options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const input = (label, key, type = 'text', step = undefined, min = undefined, max = undefined) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        min={min}
        max={max}
        value={form[key] ?? ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          {input('Age (0-120 years)', 'age', 'number', '0.01', 0, 120)}

          {selectField('Gender', 'gender', ['Male', 'Female', 'Other'])}

          {selectField('Hypertension', 'hypertension', ['0', '1'])}

          {selectField('Ever Married', 'ever_married', ['Yes', 'No'])}

          {selectField('Work Type', 'work_type', [
            'children',
            'Govt_job',
            'Never_worked',
            'Private',
            'Self-employed',
          ])}

          {selectField('Residence Type', 'residence_type', ['Rural', 'Urban'])}

          {input('Avg Glucose Level (40-600 mg/dL)', 'avg_glucose_level', 'number', '0.01', 40, 600)}
          {input('BMI (10-80)', 'bmi', 'number', '0.1', 10, 80)}

          {selectField('Smoking Status', 'smoking_status', [
            'formerly smoked',
            'never smoked',
            'smokes',
            'Unknown',
          ])}

          {selectField('Stroke', 'stroke', ['0', '1'])}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>Note:</strong> After adding a patient, use the "Predict" button to analyze stroke risk based on their data.
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            type="button"
          >
            {loading ? 'Saving...' : editingPatient ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
