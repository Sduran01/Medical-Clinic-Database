import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './PatientCreateAppointment.css';

export default function PatientCreateAppointment( {medicalId, first_name, last_name, patientBillingId} ) {
  const [doctors, setDoctors] = useState([]); //stores a list of patient's associated doctors
  const [selectedDoctor, setSelectedDoctor] = useState(''); // stores doctorsId
  const [selectedFacility, setSelectedFacility] = useState(''); //stores the current office selected
  const [appointmentType, setAppointmentType] = useState(''); //stores the appointment type
  const [reason, setReason] = useState(''); //stores the reason for appointment
  const [date, setDate] = useState(''); //stores the date chosen on the calender
  const [day, setDay] = useState(''); //ignore this
  const [isPickerEnabled, setIsPickerEnabled] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]) //stores all available timeslots
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); //stores the selected timeslot
  const [unavailableDates, setUnavailableDates] = useState([]); //stores fully booked days
  const [unavailableDays, setUnavailableDays] = useState([]); //stores the days where the doctor doesnt work at that office
  const [selectedDoctorID, setSelectedDoctorID] = useState(''); // ignore this line
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(()=>{
    if(selectedDoctor && date && selectedFacility && selectedTimeSlot){
      setIsSubmitEnabled(true);
    }
    else{
      setIsSubmitEnabled(false);
    }

  }, [selectedDoctor,date,selectedFacility,selectedTimeSlot])
  // Fetch all doctors for the patient
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        
        const response = await axios.get(`http://localhost:3000/patient/${medicalId}/appointments/doctors`);
        
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [medicalId]);



  
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      try {
        
        const formattedDate = date.toISOString().split('T')[0]; // Format date to 'YYYY-MM-DD'
        console.log('selectedDoctor!!!!',formattedDate)
        const response = await axios.get(`http://localhost:3000/patient/appointments/time_slots`, {
          params: {
            date: formattedDate,
            doctorID: selectedDoctor,
            facility: selectedFacility,
          },
          
        });
        const allTimeSlots = [
          '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
        ];
        const availableTimeSlots = allTimeSlots.filter(
          (slot) => !response.data.timeSlots.includes(slot)
        );
        console.log('timeslots:',availableTimeSlots)
        setTimeSlots(availableTimeSlots); // Update time slots based on response
      } catch (error) {
        console.error('Error fetching available time slots:', error);
      }
    };
  
    // Only run if all values are selected
    if (date && selectedDoctor && selectedFacility) {
      fetchAvailableTimeSlots();
    }
  }, [date, selectedDoctor, selectedFacility, medicalId]);



  // Enable date only if doctor and facility are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      console.log('this is the line:', selectedDoctor)
      try {
        const response = await axios.get('http://localhost:3000/patient/appointment/availability', {
          params: {
            doctorID: selectedDoctor,
            officeID: selectedFacility
          }
        });
        
        // Set the state with the unavailable dates and days
        setUnavailableDates(response.data.fullyBookedDates);
        setUnavailableDays(response.data.unavailableDays);
        setIsPickerEnabled(true);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setIsPickerEnabled(false);
      }
    };
    if (selectedDoctor && selectedFacility) {
      
      fetchAvailability();
    } else {
      setIsPickerEnabled(false);
    }
  }, [selectedDoctor, selectedFacility]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    const defaultNurses = {
      "North": {NurseId:'E2345671', Name:'John Doe' },
      "South": {NurseId:'E2345672', Name:'Alice Johnson' },
      "East": {NurseId:'E2345673', Name:'Michael Brown' },
      "West": {NurseId:'E2345674', Name:'Emily Smith' }
      
    }
    const nurse = defaultNurses[selectedFacility]
    console.log('nurse',nurse)
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const fullName = `${first_name} ${last_name}`;
      console.log('fullname',fullName)
      const appointmentData = {
        patientName : fullName,
        doctorId: selectedDoctor,
        nurseId: nurse.NurseId,
        nurseName: nurse.Name,
        facility: selectedFacility,
        patientmedicalId: medicalId,
        appointmentType,
        reason,
        date: formattedDate,
        timeSlot: selectedTimeSlot,
        patientBillingId: patientBillingId
      };
      console.log('appointmentDate',appointmentData)
      // You can post this data to the backend API
      await axios.post(`http://localhost:3000/patient/${medicalId}/appointments/create_appointment`, appointmentData);
      alert('Appointment created successfully');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.error); // Set custom error from backend
      } else {
        setErrorMessage('Failed to create appointment. Please try again.');
      }
      console.log('there was an erorr when creaing an appointment')
    }
  };
  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  };
  const isDateSelectable = (date) => {
    const day = date.getDay();
    const isWeekday = day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
    const formattedDate = date.toISOString().split('T')[0]; // Format date to 'YYYY-MM-DD'
    const isNotFullyBooked = !unavailableDates.includes(formattedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const isNotUnavailableDay = !unavailableDays.includes(dayNames[day]);
  
    // The date must be a weekday, not fully booked, and not an unavailable day
    return isWeekday && isNotFullyBooked && isNotUnavailableDay;
  };

  return (
    <div className='appointment-form'>
      <h2>Create Appointment</h2>
      <form onSubmit={handleSubmit}>
        {/* Doctor Dropdown */}
        <div className='form-group'>
          <label htmlFor="doctor">Provider (Doctor):</label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">Select a Doctor</option>
            {doctors.map((doctor, index) => (
              <option key={index} value={doctor.employee_ID}>
                {doctor.first_name} {doctor.last_name} ({doctor.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* Facility Dropdown */}
        <div className='form-group'>
          <label htmlFor="facility">Facility:</label>
          <select
            id="facility"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="">Select a Facility</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>

        {/* Appointment Type */}
        <div className='form-group'>
          <label htmlFor="appointmentType">Appointment Type:</label>
          <input
            type="text"
            id="appointmentType"
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            placeholder="e.g., Check-up, Consultation"
          />
        </div>

        {/* Reason for Visit */}
        <div className="form-group">
          <label htmlFor="reason">Reason for Visit:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide the reason for your visit"
          />
        </div>

        {/* Date Picker (enabled only if doctor and facility are selected) */}
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          {/*<input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!isPickerEnabled}
          />*/}
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
             // Disable unavailable dates
            minDate={new Date()}
            filterDate={isDateSelectable}
            placeholderText="Select a date"
            disabled={!isPickerEnabled}
          />
        </div>

        {/* time Picker (enabled only if doctor and facility are selected) */}
        <div>
          <label htmlFor="timeSlot">Time Slot:</label>
          <select
            id="timeSlot"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            disabled={
              !timeSlots.length || !date || !selectedDoctor || !selectedFacility
             }
          >
            <option value="">Select a Time Slot</option>
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className='btn'disabled={!isSubmitEnabled}>Create Appointment</button>
        {errorMessage && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
          {errorMessage}
        </div>
      )}
      </form>
    </div>
  );
}