import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientPersonalInfo.css';

export default function PatientPersonalInfo({ medicalId }) {
    const [patientInfo, setPatientInfo] = useState(null);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [updatedInfo, setUpdatedInfo] = useState({});

    useEffect(() => {
        const fetchPatientInfo = async () => {
            try {
                console.log('loooook',medicalId)
                const response = await axios.get(`http://localhost:3000/patient/${medicalId}/my_account/personal_information`);
                setPatientInfo(response.data);
                setUpdatedInfo(response.data);
            } catch (err) {
                console.error('Error fetching patient information:', err);
                setError('Failed to fetch patient information. Please try again.');
            }
        };

        if (medicalId) {
            fetchPatientInfo();
        }
    }, [medicalId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        setUpdatedInfo((prev) => {
            const keys = name.split('.'); // Split the name to handle nested keys
            if (keys.length === 1) {
                // Top-level property
                return {
                    ...prev,
                    [name]: value,
                };
            } else {
                // Nested property
                return {
                    ...prev,
                    [keys[0]]: {
                        ...prev[keys[0]],
                        [keys[1]]: value,
                    },
                };
            }
        });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`http://localhost:3000/patient/${medicalId}/my_account/personal_information`, updatedInfo);
            console.log('Update response:', response);
            setPatientInfo(updatedInfo);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating patient information:', err);
            setError('Failed to update patient information. Please try again.');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!patientInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className="patient-personal-info">
            <div className="personalInfo-header">
                <h2>Personal Information</h2> 
             <button className="edit-button" onClick={() => {
                if(isEditing){setUpdatedInfo(patientInfo)}
                setIsEditing(!isEditing)}
                }>
                {isEditing ? 'Cancel' : 'Update'}
            </button>
            
            </div>
             
            <div className="section">
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={`${updatedInfo.first_name} ${updatedInfo.last_name}`}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Date of Birth:</label>
                <input
                    type="text"
                    name="birthdate"
                    value={updatedInfo.birthdate}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Age:</label>
                <input
                    type="text"
                    name="age"
                    value={updatedInfo.age}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>

            <div className="section">
                <h3>Address Details</h3>
                <label>Address 1:</label>
                <input
                    type="text"
                    name="address.line_1"
                    value={updatedInfo.address.line_1}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Address 2:</label>
                <input
                    type="text"
                    name="address.line_2"
                    value={updatedInfo.address.line_2 || ''}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>City:</label>
                <input
                    type="text"
                    name="address.city"
                    value={updatedInfo.address.city}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>State:</label>
                <input
                    type="text"
                    name="address.state"
                    value={updatedInfo.address.state}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Zip:</label>
                <input
                    type="text"
                    name="address.zip"
                    value={updatedInfo.address.zip}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>

            <div className="section">
                <h3>Contact Details</h3>
                <label>Personal Email:</label>
                <input
                    type="text"
                    name="contact.personal_email"
                    value={updatedInfo.contact.personal_email}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Home Phone:</label>
                <input
                    type="text"
                    name="contact.home_phone"
                    value={updatedInfo.contact.home_phone}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Work Phone:</label>
                <input
                    type="text"
                    name="contact.work_phone"
                    value={updatedInfo.contact.work_phone || ''}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
                <label>Cell Phone:</label>
                <input
                    type="text"
                    name="contact.cell_phone"
                    value={updatedInfo.contact.cell_phone}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
            {isEditing && (
                <button className="save-button" onClick={handleSave}>
                    Save
                </button>
            )}
        </div>
    );
}
