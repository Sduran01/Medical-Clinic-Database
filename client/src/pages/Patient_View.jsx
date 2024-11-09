import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientNavBar from './PatientNavBar';
import PatientDashBoard from './PatientDashBoard';
import './Patient_View.css'
import PatientCreateAppointment from './PatientCreateAppointment';
import PatientUpcomingAppointment from './PatientUpcomingAppointments';
import PatientPersonalInfo from './PatientPersonalInfo';
import PatientReferrals from './PatientReferrals';
import PatientLabTests from './PatientLabTests';
import PatientMedicalHistory from './PatientMedicalHistory';
import PatientPasswordChange from './PatientPasswordChange';
import PatientPayBill from './PatientPayBill';

const Patient_View = () => {
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [patientInfo, setPatientInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const patient_Data = localStorage.getItem('patient');
        // Add this line for debugging
        if (patient_Data) {
            
            setPatientInfo(JSON.parse(patient_Data))
            
            setPatient(JSON.parse(patient_Data).medical_ID);
            console.log('retrieve patient data:', patient_Data)
        }
       
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('patient'); // Clear patient info
        navigate('/'); // Navigate to the main page
    };


    if (!patient) {
        return <div>No patient information found.</div>;
    }
    
    const renderContent = () => {
        switch (activeTab) {
          case 'personal_info':
            return <PatientPersonalInfo medicalId={patient}/>;
          case 'password_change':
            return <PatientPasswordChange medicalId={patient} />;
          case 'create_appointment':
            return <PatientCreateAppointment medicalId={patient} 
            first_name={patientInfo.first_name} last_name={patientInfo.last_name}
            patientBillingId = {patientInfo.billingID}  />;
          case 'upcoming_appointments':
            return <PatientUpcomingAppointment medicalId={patient} />;
          case 'medical_history':
            return <PatientMedicalHistory medicalId={patient} />;
          case 'referrals':
            return <PatientReferrals medicalId={patient} />
          case 'lab_tests':
            return <PatientLabTests medicalId={patient} />
          case 'pay_bill':
            return <PatientPayBill medicalId={patient}/>
          default:
            return <PatientDashBoard medicalId={patient} />;
        }}

    return (
        <div className="PatientView">
          <PatientNavBar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} 
          first_name={patientInfo.first_name} />
        
        <div className="content">
            {renderContent()}
        </div>
        

        </div>
        
        
    );
};


export default Patient_View;