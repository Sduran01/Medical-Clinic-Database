import React, { useState } from 'react';
import axios from 'axios';
import './PatientPasswordChange.css';

export default function PatientPasswordChange({ medicalId }) {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:3000/patient/${medicalId}/my_account/password_change`, {
                password,
            });

            setMessage(response.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <div className="patient-password-change">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                    <label htmlFor="password">New Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
