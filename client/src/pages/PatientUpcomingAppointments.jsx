import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientUpcomingAppointments.css';
import PatientModal from './PatientModal';

const PatientUpcomingAppointments = ({ medicalId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [acceptPenalty, setAcceptPenalty] = useState(false);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/patient/${medicalId}/appointments/upcoming_appointments`);
        console.log('response', response);
        setAppointments(response.data.appointments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch upcoming appointments');
        setLoading(false);
      }
    };

    if (medicalId) {
      fetchUpcomingAppointments();
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
            // Successful cancellation without a penalty, remove from state
            setAppointments(prevAppointments =>
                prevAppointments.filter(appointment => appointment.appointment_ID !== appointmentId)
            );
            handleCloseModal();
        }
    } catch (err) {
        // Check if the error is a 400 status with canProceed for penalty confirmation
        if (err.response && err.response.status === 400 && err.response.data.canProceed) {
            console.log("Penalty confirmation required:", err.response.data);
            setShowModal(false);
            setShowCancelModal(true);
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
        // Remove the appointment from the list after applying the penalty
        setAppointments(prevAppointments =>
          prevAppointments.filter(appointment => appointment.appointment_ID !== appointmentId)
        );
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
        handleCloseCancelModal();
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
    <div className="upcoming-appointments">
      <h2>Upcoming Appointments</h2>
      <div className="cards-container">
        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <div className="card" key={index}>
              <h3>Appointment {index + 1}</h3>
              <p><strong>Date & Time:</strong> {new Date(appointment.dateTime).toLocaleString()}</p>
              <p><strong>Doctor:</strong> {appointment.doctor}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Office:</strong> {appointment.name}</p>
              <p><strong>Address:</strong> {appointment.address}</p>
              <button
                className="cancel-button"
                onClick={() => handleShowModal(appointment.appointment_ID)}
              >
                Cancel Appointment
              </button>
            </div>
          ))
        ) : (
          <p>No upcoming appointments.</p>
        )}
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

export default PatientUpcomingAppointments;
