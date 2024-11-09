import React, { useState } from 'react';
import './PatientNavBar.css';

const PatientNavbar = ({ activeTab, setActiveTab ,handleLogout, first_name}) => {
  // State to manage the dropdown visibility for "My Account"
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [appointmentDropdownOpen, setAppointmentDropdownOpen] = useState(false);
  const [medicalRecordsDropdownOpen, setMedicalRecordsDropdownOpen] = useState(false);


  const toggleAccountDropdown = () => {
    setAppointmentDropdownOpen(false);
    setMedicalRecordsDropdownOpen(false);
    setAccountDropdownOpen(!accountDropdownOpen);
  };
  const toggleAppointmentDropdown = () => {
    setAccountDropdownOpen(false);
    setMedicalRecordsDropdownOpen(false);
    setAppointmentDropdownOpen(!appointmentDropdownOpen);
  };
  const toggleMedicalRecordsDropdown = () => {
    setAccountDropdownOpen(false);
    setAppointmentDropdownOpen(false);
    setMedicalRecordsDropdownOpen(!medicalRecordsDropdownOpen);
  };
  const toggleAll =() =>{
    setAccountDropdownOpen(false);
    setAppointmentDropdownOpen(false);
    setMedicalRecordsDropdownOpen(false);
  }

 

  return (
    <nav className="patient-navbar">
      {/* Dashboard tab without submenu */}
      <div className="patient-name">
        <span>Welcome,{first_name}</span>
      </div>
       {/* dashboard tab */}
      <button
        className={activeTab === 'dashboard' ? 'active' : ''}
        onClick={() => {
          setActiveTab('dashboard')
          toggleAll()
        }}
      >
        Dashboard
      </button>

      {/* My Account tab with a dropdown */}
      <div className="dropdown">
        
        <button
          className={`dropdown-toggle ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => {
            if (activeTab !== 'account' && activeTab !== 'appointment' 
              && activeTab!=='dashboard' && activeTab !== 'medical_records') 
            {
              setActiveTab(activeTab);
            } // Set active tab to 'account'
            else{
              setActiveTab('account')
            }
            toggleAccountDropdown(); // Toggle the dropdown visibility
          }}
        >
          My Account
        </button>

        {/* Submenu for My Account */}
        {accountDropdownOpen   &&(   //took off && activeTab ==='account'
          <div className="dropdown-menu">
            <button
              className={activeTab === 'personal_info' ? 'active' : ''}
              onClick={() => {
                setActiveTab('personal_info')
                toggleAccountDropdown();
              }}
            >
              Personal Information
            </button>
            <button
              className={activeTab === 'password_change' ? 'active' : ''}
              onClick={() => {
                setActiveTab('password_change')
                toggleAccountDropdown();
              }}
            >
              Password Change
            </button>
          </div>
        )}
      </div>





      <div className="dropdown">
        <button
          className={`dropdown-toggle ${activeTab === 'appointment' ? 'active' : ''}`}
          onClick={() => {
            if (activeTab !== 'account' && activeTab !== 'appointment' 
              && activeTab!=='dashboard' && activeTab !== 'medical_records') 
            {
              setActiveTab(activeTab);
            } // Set active tab to 'account'
            else{
              setActiveTab('appointment');
            }
           // Set active tab to 'account'
            toggleAppointmentDropdown(); // Toggle the dropdown visibility
          }}
        >
          Appointments
        </button>
          
        {/* Submenu for appointments */}
        {appointmentDropdownOpen  &&(
          <div className="dropdown-menu">
            <button
              className={activeTab === 'upcoming_appointments' ? 'active' : ''}
              onClick={() => {
                setActiveTab('upcoming_appointments')
                toggleAppointmentDropdown()
              }}
            >
              Upcoming Appointments
            </button>
            <button
              className={activeTab === 'create_appointment' ? 'active' : ''}
              onClick={() => {
                setActiveTab('create_appointment')
                toggleAppointmentDropdown()
              }}
            >
              Create Appointment
            </button>
          </div>
        )}
      </div>


      <div className="dropdown">
        <button
          className={`dropdown-toggle ${activeTab === 'medical_records' ? 'active' : ''}`}
          onClick={() => {
            if (activeTab !== 'account' && activeTab !== 'appointment' 
              && activeTab!=='dashboard' && activeTab !== 'medical_records') 
            {
              setActiveTab(activeTab);
            } // Set active tab to 'account'
            else{
              setActiveTab('medical_records');
            }
            
            toggleMedicalRecordsDropdown();
          }}
        >
          Medical Records
        </button>

        {/* Submenu for Medical Records */}
        {medicalRecordsDropdownOpen &&  (
          <div className="dropdown-menu">
            <button
              className={activeTab === 'medical_history' ? 'active' : ''}
              onClick={() => {
                setActiveTab('medical_history');
                toggleMedicalRecordsDropdown();
              }}
            >
              Medical_History
            </button>
            <button
              className={activeTab === 'referrals' ? 'active' : ''}
              onClick={() => {
                setActiveTab('referrals');
                toggleMedicalRecordsDropdown();
              }}
            >
              Referrals
            </button>
            <button
              className={activeTab === 'lab_tests' ? 'active' : ''}
              onClick={() => {
                setActiveTab('lab_tests');
                toggleMedicalRecordsDropdown();
              }}
            >
              Lab Tests
            </button>
          </div>
        )}
      </div>
      {/* Pay Bill button */}
      <button
        className={activeTab === 'pay_bill' ? 'active' : ''}
        onClick={() => {
          setActiveTab('pay_bill');
          toggleAll();
        }}
      >
        Pay Bill
      </button>

      {/* Sign Off button */}
      <button
        className="signoff-button"
        onClick={handleLogout}
      >
        Sign Off
      </button>
    </nav>
  );
};

export default PatientNavbar;