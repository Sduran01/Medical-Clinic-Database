import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PatientModal from './PatientModal';
import './PatientUpcomingAppointments.css';

const Dashboard = ({ medicalId }) => {
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [recentTests, setRecentTests] = useState(null);
  const [recentReferrals, setRecentReferrals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        console.log('api/patient', typeof medicalId, medicalId);
        const response = await axios.get(`http://localhost:3000/api/patient/${medicalId}`);
        const { upcomingAppointment, recentTests, recentReferrals } = response.data;

        setUpcomingAppointment(upcomingAppointment);
        setRecentTests(recentTests);
        setRecentReferrals(recentReferrals);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient data');
        setLoading(false);
      }
    };

    if (medicalId) {
      fetchPatientData();
    }
  }, [medicalId]);

  const handleShowModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointmentId(null);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedAppointmentId(null);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await axios.put(`http://localhost:3000/patient/${medicalId}/appointments/${appointmentId}/attempt-cancel`);
      console.log('Cancel response:', response);

      if (response.status === 200) {
        // Successful cancellation without penalty
        setUpcomingAppointment(null); // Remove the canceled appointment
        handleCloseModal();
      }
    } catch (err) {
      // Check if penalty confirmation is required (status 400 and `canProceed` flag)
      if (err.response && err.response.status === 400 && err.response.data.canProceed) {
        console.log("Penalty confirmation required:", err.response.data);
        setShowModal(false);
        setShowCancelModal(true); // Show penalty confirmation modal
      } else {
        console.error('Error cancelling appointment:', err);
        setError('Failed to cancel appointment');
        handleCloseModal();
      }
    }
  };

  const handleCancelWithPenalty = async (appointmentId) => {
    try {
      const response = await axios.put(`http://localhost:3000/patient/${medicalId}/appointments/${appointmentId}/finalize-cancel`);
      console.log('Finalize Cancel response:', response);

      if (response.status === 200) {
        setUpcomingAppointment(null); // Remove the appointment after penalty cancellation
        handleCloseCancelModal();
      }
    } catch (err) {
      console.error('Error finalizing cancellation with penalty:', err);
      setError('Failed to finalize cancellation');
      handleCloseCancelModal();
    }
  };

  const handleRevertCancel = async (appointmentId) => {
    try {
      const response = await axios.put(`http://localhost:3000/patient/${medicalId}/appointments/${appointmentId}/revert-cancel`);
      console.log('Revert Cancel response:', response);

      if (response.status === 200) {
        handleCloseCancelModal(); // Close penalty confirmation modal on revert
      }
    } catch (err) {
      console.error('Error reverting cancellation:', err);
      setError('Failed to revert cancellation');
      handleCloseCancelModal();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Welcome to your Dashboard</h2>
      <div className="cards-container">
        {/* Upcoming Appointment Card */}
        <div className="card">
          <h3>Upcoming Appointment</h3>
          {upcomingAppointment ? (
            <div>
              <p><strong>Date & Time:</strong> {new Date(upcomingAppointment.dateTime).toLocaleString()}</p>
              <p><strong>Doctor:</strong> {upcomingAppointment.doctor}</p>
              <p><strong>Reason:</strong> {upcomingAppointment.reason}</p>
              <p><strong>Office:</strong> {upcomingAppointment.name}</p>
              <p><strong>Address:</strong> {upcomingAppointment.address}</p>
              <button
                className="cancel-button"
                onClick={() => handleShowModal(upcomingAppointment.appointment_ID)}
              >
                Cancel Appointment
              </button>
            </div>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        {/* Recent Test Results Card */}
        <div className="card">
          <h3>Recent Test Results</h3>
          {recentTests && recentTests.length > 0 ? (
            <div>
              {recentTests.map((test, index) => (
                <div key={index}>
                  <p><strong>Test Name:</strong> {test.test_name}</p>
                  <p><strong>Date:</strong> {new Date(test.test_date).toLocaleDateString()}</p>
                  <p><strong>Result:</strong> {test.result}</p>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <p>No recent test results.</p>
          )}
        </div>

        {/* Recent Referrals Card */}
        <div className="card">
          <h3>Recent Referrals</h3>
          {recentReferrals && recentReferrals.length > 0 ? (
            <div>
              {recentReferrals.map((referral, index) => (
                <div key={index}>
                  <p><strong>Status:</strong> {referral.status}</p>
                  <p><strong>Date Reviewed:</strong> {new Date(referral.date_reviewed).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {referral.reason}</p>
                  <p><strong>Originating Doctor:</strong> {referral.origin_first_name} {referral.origin_last_name}</p>
                  <p><strong>Receiving Doctor:</strong> {referral.receive_first_name} {referral.receive_last_name}</p>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <p>No recent referrals.</p>
          )}
        </div>
      </div>

      {/* First Modal for initial cancellation */}
      <PatientModal
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={() => handleCancelAppointment(selectedAppointmentId)}
        title="Confirm Cancellation"
      >
        Are you sure you want to cancel this appointment?
      </PatientModal>

      {/* Second Modal for penalty confirmation */}
      <PatientModal
        show={showCancelModal}
        onClose={() => handleRevertCancel(selectedAppointmentId)}
        onConfirm={() => handleCancelWithPenalty(selectedAppointmentId)}
        title="Confirm Cancellation with Penalty"
      >
        This appointment is within 24 hours. A cancellation fee will apply if you proceed. Do you want to continue?
      </PatientModal>
    </div>
  );
};

export default Dashboard;
