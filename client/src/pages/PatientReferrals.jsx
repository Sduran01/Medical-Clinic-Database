import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientReferrals.css'

export default function PatientReferrals({ medicalId }) {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReferralHistory = async () => {
            try {
                // Fetch referral data from the backend
                console.log('referral', medicalId)
                const response = await axios.get(`http://localhost:3000/patient/${medicalId}/medical_records/referral_history`);
                
                // Update the referral data state
                console.log('referral_response',response)
                setReferrals(response.data.referrals);
                setLoading(false);
            } catch (err) {
                // Handle errors during fetching
                console.log('referral error', err);
        
                // Check if the error response is a 404 (No referrals found)
                if (err.response && err.response.status === 404) {
                    setError('No referrals found for this patient.');
                } else {
                    setError('Failed to retrieve referral history. Please try again later.');
                }
        
                setLoading(false);
            }
        };

        // Trigger the data fetching
        if (medicalId) {
            fetchReferralHistory();
        }
    }, [medicalId]);

    if (loading) {
        return <div>Loading referral history...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="referral-container">
            <h2>Referral History</h2>
            {referrals.length === 0 ? (
                <p>No referrals found.</p>
            ) : (
                <table className="referral-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Date Created</th>
                            <th>Reason</th>
                            <th>Originating Doctor</th>
                            <th>Receiving Doctor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map((referral, index) => (
                            <tr key={index}>
                                <td>{referral.status}</td>
                                <td>{new Date(referral.date_created).toLocaleDateString()}</td>
                                <td>{referral.reason}</td>
                                <td>{`${referral.origin_first_name} ${referral.origin_last_name}`}</td>
                                <td>{`${referral.receive_first_name} ${referral.receive_last_name}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}