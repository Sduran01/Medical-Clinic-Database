import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientMedicalHistory.css';

export default function PatientMedicalHistory({ medicalId }) {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/patient/${medicalId}/medical_records/medical_history`);
        setMedicalHistory(response.data.medicalHistory);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medical history:', err);
        setError('Failed to retrieve medical history. Please try again later.');
        setLoading(false);
      }
    };

    if (medicalId) {
      fetchMedicalHistory();
    }
  }, [medicalId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="medical-history">
      <h2>Medical History</h2>
      {medicalHistory.length > 0 ? (
        <table className="medical-history-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Treatment</th>
              <th>Diagnosis Date</th>
              <th>Resolved</th>
              <th>Medication</th>
            </tr>
          </thead>
          <tbody>
            {medicalHistory.map((record, index) => (
              <tr key={index}>
                <td>{record.conditions}</td>
                <td>{record.treatment}</td>
                <td>{new Date(record.diagnosis_date).toLocaleDateString()}</td>
                <td>{record.resolved ? 'Yes' : 'No'}</td>
                <td>{record.medication}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No medical history available.</p>
      )}
    </div>
  );
}