import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';


const Doctor_View = () => {
    const [employee, setEmployee] = useState(null);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [info, setInfo] = useState([]);
    const [availability, setAvailability] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const employee_Data = localStorage.getItem('employee'); //retrieve employee info using employee key
        console.log('Retrieved employee data:', employee_Data); // Add this line for debugging
        if (employee_Data) {
            const parsedDoctorInfo = JSON.parse(employee_Data);
            setEmployee(parsedDoctorInfo);
            const fetchAllInfo = async () => {
                try {
                    const res = await axios.get(`https://group8backend.azurewebsites.net/doctor_view/${parsedDoctorInfo.employee_ID}`); //use axios to request employee info, passing employeeID as argument
                    setInfo(res.data); //use the info we just got to update info state
                    //console.log("Employee state", employee);
                    console.log("Retrieved info", info);
                    //console.log("THE EMPLOYEE ID ON LINE 27 IS", employee.employee_ID)
                    const doctorId = parsedDoctorInfo.employee_ID; //fetch office where director works (function defined below)
                    //setOfficeId(fetchedOfficeId); //update officeId state with fetched office ID

                    await handleViewAppointments(doctorId); //return array of future appointments, and an array of appintment IDs

                    if (res.data.length > 0) {
                        //const firstDoctorId = res.data[0].employee_ID; //res should correspond to a single employee but whatever
                        await handleViewPatients(doctorId); //get array of patients of doctor
                        //await handleViewAvailability(doctorId);
                    }
                } catch (err) {
                    console.log(err);
                }
            };
            fetchAllInfo();

        }

    }, []);

    useEffect(() => {
        console.log('Updated info:', info);
    }, [info]);
    useEffect(() => {
        console.log("Scheduled Appointments:", appointments);
    }, [appointments]);
    useEffect(() => {
        console.log("Patients:", patients);
    }, [patients]);
    useEffect(() => {
        console.log("Availability:", availability);
    }, [availability]);
    useEffect(() => {
        console.log("EMPLOYEE STATE", employee)
    }, [employee]);

    const handleViewAppointments = async (doctorId) => { //argument is directorId
        try {
            const res = await axios.get(`https://group8backend.azurewebsites.net//appointments/${doctorId}`);//request appointments that correspond to directorId
            const futureAppointments = res.data.filter(appointment => //.filter filters data in res using below comparison
                new Date(appointment.dateTime) > new Date() //create date with appointment datetime, use > to compare to current date
            ); //=> means lambda function

            setAppointments(futureAppointments); //update appointments state with filtered appointment list
            //const appointmentIdsList = res.data.map(appointment => appointment.appointment_ID).join(','); 
            //^^ gets list of appointment ids
            //const appointmentIds = futureAppointments.map(appointment => appointment.appointment_ID); //create new array of appointmentIDs
            //await fetchProfit(appointmentIdsList);
        } catch (err) {
            console.log('Error fetching appointments:', err);
        }
    };

    const handleViewPatients = async (doctorId) => { //doctorId passed as argument
        try {
            const res = await axios.get(`https://group8backend.azurewebsites.net//doctors_patient/${doctorId}`); //request doctors_patient entries with doctor_ids
            setPatients(res.data); //update patients state with res
        } catch (err) {
            console.log('Error fetching patients:', err);
        }
    };

    // const handleViewAvailability = async (doctorId) => { //doctorId passed as argument
    //     try {
    //         const res = await axios.get(`https://group8backend.azurewebsites.net//doc_availability/${doctorId}`); //request doctors_patient entries with doctor_ids
    //         setAvailability(res.data); //update patients state with res
    //     } catch (err) {
    //         console.log('Error fetching availability:', err);
    //     }
    // };

    // const handleViewAvailability = async (doctorId) => {
    //     try {
    //         const res = await axios.get()
    //     }
    // }

    const handleLogout = () => {
        localStorage.removeItem('employee'); // Clear employee info
        navigate('/'); // Navigate to the main page
    };

    if (!employee) {
        return <div>No employee information found.</div>;
    }

    return ( //for displaying stuff I guess
        <div className="container">
            <div className="form">
                <h1>Employee Information</h1>
                <p>ID: {employee.employee_ID}</p>
                <p>Name: {employee.first_name} {employee.last_name}</p>
                <p>Role: {employee.role}</p>
                <button className="logout" onClick={handleLogout}>Logout</button>
            </div>

            <div className="di_container di_appointments">
                <h2>Upcoming Appointments</h2>
                {appointments.length > 0 ? (
                    appointments.map(appointment => (
                        <div
                            className="di_info-card"
                            key={appointment.appointment_ID}
                            onClick={() => navigate(`/appointment_info/${appointment.appointment_ID}`)}
                        >
                            <h3>{appointment.patientName}</h3>
                            <p>Doctor: {appointment.doctor}</p>
                            <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
                            <p>Reason: {appointment.reason}</p>
                        </div>
                    ))
                ) : (
                    <p>No appointments currently set.</p>
                )}
                {/* <button type="button"
                    onClick={() => navigate(`/Avail_summary/${employee.employee_ID}`)}
                ></button> */}
            </div>
            <div className="di_container di_patients">
                <h2>Patients Overview</h2>
                {patients.length > 0 ? (
                    patients.map(patient => (
                        <div
                            className="di_info-card"
                            key={patient.medical_ID}
                            onClick={() => navigate(`/patient_info/${patient.medical_ID}`)}
                        >
                            <h3>{patient.first_name} {patient.last_name}</h3>
                            <p>Phone: {patient.home_phone}</p>
                            <p>Email: {patient.personal_email}</p>
                        </div>
                    ))
                ) : (
                    <p>No patients found for this doctor.</p>
                )}
            </div>
            <div className="di_container"
                onClick={() => navigate(`/Doc_Avail_Summary/${employee.employee_ID}`)}
            >
                <h2> Edit available hours</h2>
                {/* <div onClick={() => navigate(`/Avail_summary/${employee.employee_ID}`)}>
                    <h3>See Current Availability</h3> */}
            </div>
            <div className="di_container"
                onClick={() => navigate(`/Create_Referral/${employee.employee_ID}`)}
            >
                <h2> Generate Referral </h2>

            </div>
            {/* <div className="di_container"
                //onClick={() => console.log(`/View_Edit_Referrals/${employee.employee_ID}`)}
                onClick={() => navigate(`/View_Edit_Referrals/${employee.employee_ID}`)}
            >
                <h2> View my Referrals </h2>

            </div> */}
            {/* {availability.length > 0 ? (

                    
                    availability.map(availability => (
                        <div
                            className="di_info-card"
                            key={availability.medical_ID}
                            onClick={() => navigate(`/patient_info/${patient.medical_ID}`)}
                        >
                            <h3>{patient.first_name} {patient.last_name}</h3>
                            <p>Phone: {patient.home_phone}</p>
                            <p>Email: {patient.personal_email}</p>
                        </div>
                    ))
                ) : (
                    <p>No patients found for this doctor.</p>
                )} */}

            {/* <div className="di_container di_patients">
                <h2></h2>
            </div> */}
        </div>
    );
};

export default Doctor_View;
