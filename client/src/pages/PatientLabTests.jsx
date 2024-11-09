import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientLabTests.css'


export default function PatientLabTests({ medicalId }) {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestHistory = async () => {
            try {
                // Fetch lab test history data from the backend
                const response = await axios.get(`http://localhost:3000/patient/${medicalId}/medical_records/test_history`);
                
                // Update the state with the retrieved data
                setTests(response.data.tests);
                setLoading(false);
            } catch (err) {
                // Handle errors during fetching
                if (err.response && err.response.status === 404) {
                    setError('No test history found for this patient.');
                } else {
                    setError('Failed to retrieve test history. Please try again later.');
                }
                setLoading(false);
            }
        };

        // Fetch test history data if medicalId is available
        if (medicalId) {
            fetchTestHistory();
        }
    }, [medicalId]);

    // If still loading, show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // If there's an error, display it
    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div >
            <h2>Lab Test History</h2>
            {tests.length > 0 ? (
                <div className="test-card-container">
                    {tests.map((test, index) => (
                        <div key={index} className="test-card">
                            <p><strong>Test Name:</strong> {test.test_name}</p>
                            <p><strong>Date:</strong> {new Date(test.test_date).toLocaleDateString()}</p>
                            <p><strong>Result:</strong> {test.result}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No test history available.</p>
            )}
        </div>
    );
}