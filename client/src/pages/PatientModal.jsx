import React from 'react';
import './PatientModal.css'; // Add your styles here

const CustomModal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;

    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal">
                <div className="custom-modal-header">
                    <h3>{title}</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="custom-modal-body">
                    {children}
                </div>
                <div className="custom-modal-footer">
                    <button className="cancel-button" onClick={onClose}>Close</button>
                    <button className="confirm-button" onClick={onConfirm}>Confirm Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;